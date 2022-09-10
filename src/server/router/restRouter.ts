import { decodePaymentRequest, subscribeToPayViaRequest } from 'lightning'
import { z } from 'zod'
import * as trpc from '@trpc/server'
import { TRPCError } from '@trpc/server'
import { OpenApiMeta } from 'trpc-openapi'
import { lnd } from '../services/lnd'
import { prisma } from '../db/client'
import { v4 as uuid } from 'uuid'
import { CreateNextContextOptions } from '@trpc/server/adapters/next'
import secp256k1 from 'secp256k1'
import { Prisma } from '@prisma/client'

export type Context = {
    requestId: string
}

const globalMaxWithdrawal = 100

export const createRestContext = async ({ req, res }: CreateNextContextOptions): Promise<Context> => {
    const requestId = uuid()
    res.setHeader('x-request-id', requestId)

    return { requestId }
}

export const restRouter = trpc
    .router<Context, OpenApiMeta>()
    .query('lnAuth', {
        meta: { openapi: { enabled: true, method: 'GET', path: '/lnauth' } },
        input: z.object({
            sig: z.string(),
            k1: z.string(),
            key: z.string(),
        }),
        output: z.any(),
        async resolve({ ctx, input }) {
            try {
                const sig = Buffer.from(input.sig, 'hex')
                const k1 = Buffer.from(input.k1, 'hex')
                const key = Buffer.from(input.key, 'hex')
                const signature = secp256k1.signatureImport(sig)
                if (secp256k1.ecdsaVerify(signature, k1, key)) {
                    const lnAuth = await prisma.lnAuthentication.update({
                        where: { k1: input.k1 },
                        data: { pubkey: input.key },
                    })
                    return { status: 'OK' }
                }
            } catch (error) {
                console.log(error)
            }

            let reason = 'signature verification failed'
            if (!input.sig) {
                reason = 'no sig query variable provided'
            } else if (!input.k1) {
                reason = 'no k1 query variable provided'
            } else if (!input.key) {
                reason = 'no key query variable provided'
            }
            return new TRPCError({ code: 'BAD_REQUEST', message: reason })
        },
    })
    .query('lnWith', {
        meta: { openapi: { enabled: true, method: 'GET', path: '/lnwith' } },
        input: z.object({
            k1: z.string(),
            sig: z.string().optional(),
            key: z.string().optional(),
            pr: z.string().optional(),
        }),
        output: z.any(),
        async resolve({ ctx, input }) {
            if (!input.k1) {
                return new TRPCError({ code: 'BAD_REQUEST', message: 'k1 not provided' })
            }

            const { pr, sig, key, k1 } = input

            console.log('lnWith', { pr, sig, key, k1 })

            if (pr) {
                return doWithdrawal({ k1, pr })
            }

            let reason
            try {
                const lnWithdrawal = await prisma.lnWithdrawal.findFirst({
                    where: {
                        k1: input.k1,
                        createdAt: {
                            gt: new Date(new Date().setHours(new Date().getHours() - 1)),
                        },
                    },
                })
                if (lnWithdrawal) {
                    const user = await prisma.user.findUnique({
                        where: { id: lnWithdrawal.userId! },
                        include: { invoices: true, withdrawalsFinal: true },
                    })
                    if (user) {
                        const paidIn = user?.invoices
                            .filter((invoice) => invoice.confirmedAt)
                            .reduce((acc, cur) => acc + (cur?.mSatsReceived ?? 0), 0)
                        const paidOut = user?.withdrawalsFinal
                            .filter((withdrawal) => withdrawal.status === 'CONFIRMED')
                            .reduce((acc, cur) => acc + (cur?.mSatsPaid ?? 0), 0)
                        const maxAmount = (paidIn ? paidIn - (paidOut ?? 0) : 0) / 1000
                        return {
                            tag: 'withdrawRequest', // type of LNURL
                            callback: `https://${process.env.DOMAIN}:3000/api/lnwith`, // TODO: change to https in prod
                            k1: input.k1,
                            defaultDescription: `Withdrawal for @${user.userName} on noteblitz.app for maximum ${
                                maxAmount - 1
                            }`, // A default withdrawal invoice description
                            minWithdrawable: 10,
                            maxWithdrawable: maxAmount * 1000 - 1000,
                        }
                    } else {
                        reason = 'user not found'
                    }
                } else {
                    reason = 'withdrawal not found'
                }
            } catch (error) {
                console.log(error)
                reason = 'internal server error'
            }

            console.log(reason)

            throw new TRPCError({ code: 'BAD_REQUEST', message: reason })
        },
    })

async function doWithdrawal(query: { k1: string; pr: string }) {
    const lnWithdrawal = await prisma.lnWithdrawal.findUnique({ where: { k1: query.k1 } })
    if (!lnWithdrawal) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'invalid k1' })
    }
    const me = await prisma.user.findUnique({ where: { id: lnWithdrawal.userId ?? '' } }) // TODO: fix this
    if (!me) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'user not found' })
    }

    console.log('k1', query.k1)
    console.log('pr', query.pr)

    const withdrawalData = async () => {
        let decoded: any
        try {
            decoded = await decodePaymentRequest({ lnd, request: query.pr })
        } catch (error) {
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'could not decode invoice' })
        }

        if (decoded.mtokens > globalMaxWithdrawal * 1000) {
            throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `you can only withdraw up to ${globalMaxWithdrawal}`,
            })
        }

        if (!decoded.mtokens || Number(decoded.mtokens) <= 0) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'your invoice must specify an amount' })
        }

        const mSatsFee = Number(10) * 1000

        const user = await prisma.user.findUnique({
            where: { id: me.id },
            include: { invoices: true, withdrawalsFinal: true },
        })

        const paidIn = user?.invoices
            .filter((invoice) => invoice.confirmedAt)
            .reduce((acc, cur) => acc + (cur?.mSatsReceived ?? 0), 0)
        const paidOut = user?.withdrawalsFinal
            .filter((withdrawal) => withdrawal.status === 'CONFIRMED')
            .reduce((acc, cur) => acc + (cur?.mSatsPaid ?? 0), 0)
        const maxAmount = paidIn ? paidIn - (paidOut ?? 0) : 0

        if (decoded.mtokens > maxAmount) {
            return { status: 'ERROR', reason: 'insufficient balance' }
        }

        const withdrawal = await prisma.withdrawal.create({
            data: {
                user: { connect: { id: user?.id } },
                status: 'CONFIRMED',
                bolt11: query.pr,
                mSatsFeePaid: mSatsFee,
                mSatsFeePaying: mSatsFee,
                mSatsPaid: Number(decoded.mtokens),
                mSatsPaying: Number(decoded.safe_tokens) * 1000,
                hash: decoded.id,
            },
        })

        const sub = await subscribeToPayViaRequest({
            lnd,
            request: query.pr,
            max_fee: Number(10),
            pathfinding_timeout: 30000,
        })

        sub.once('confirmed', async (payment) => {
            await prisma.lnWithdrawal.update({
                where: { k1: query.k1 },
                data: { withdrawalId: withdrawal?.id },
            })
        })

        return withdrawal as { id: string }
    }

    const resolvedWithdrawal = await withdrawalData()

    console.log('resolvedWithdrawal', resolvedWithdrawal)

    if ('id' in resolvedWithdrawal) {
        const updatedLnWithdrawal = await prisma.lnWithdrawal
            .update({
                where: { k1: query.k1 },
                data: { withdrawalId: resolvedWithdrawal.id },
            })
            .catch((err) => console.log(err))
    } else {
        return { status: 'BAD_REQUEST', reason: resolvedWithdrawal.reason }
    }

    return { status: 'OK' }
}
