import { decodePaymentRequest, subscribeToPayViaRequest } from 'lightning'
import { z } from 'zod'
import * as trpc from '@trpc/server'
import { TRPCError } from '@trpc/server'
import { OpenApiMeta } from 'trpc-openapi'
import { lnd } from '../services/lnd'
import { prisma } from '../db/client'
import { v4 as uuid } from 'uuid'
import { CreateNextContextOptions } from '@trpc/server/adapters/next'

export type Context = {
    requestId: string
}

const globalMaxWithdrawal = 100

export const createRestContext = async ({ req, res }: CreateNextContextOptions): Promise<Context> => {
    const requestId = uuid()
    res.setHeader('x-request-id', requestId)

    return { requestId }
}

export const restRouter = trpc.router<Context, OpenApiMeta>().mutation('createWithdrawal', {
    meta: { openapi: { enabled: true, method: 'POST', path: '/create-withdrawal' } },
    input: z.object({
        invoice: z.string(),
        maxFee: z.number(),
        me: z.string(),
        k1: z.string(),
    }),
    output: z.any(),
    async resolve({ ctx, input }) {
        let decoded: any
        try {
            decoded = await decodePaymentRequest({ lnd, request: input.invoice })
        } catch (error) {
            console.log(error)
            throw new TRPCError({ code: 'UNAUTHORIZED', message: 'could not decode invoice' })
        }

        if (decoded.mtokens > globalMaxWithdrawal * 1000) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: `you can only withdraw up to ${globalMaxWithdrawal}` })
        }

        if (!decoded.mtokens || Number(decoded.mtokens) <= 0) {
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'your invoice must specify an amount' })
        }

        const mSatsFee = Number(input.maxFee) * 1000

        const user = await prisma.user.findUnique({
            where: { id: input.me },
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
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'insufficient balance' })
        }

        const withdrawal = await prisma.withdrawal.create({
            data: {
                user: { connect: { id: user?.id } },
                status: 'CONFIRMED',
                bolt11: input.invoice,
                mSatsFeePaid: mSatsFee,
                mSatsFeePaying: mSatsFee,
                mSatsPaid: Number(decoded.mtokens),
                mSatsPaying: Number(decoded.safe_tokens) * 1000,
                hash: decoded.id,
            },
        })

        const sub = await subscribeToPayViaRequest({
            lnd,
            request: input.invoice,
            max_fee: Number(input.maxFee),
            pathfinding_timeout: 30000,
        })

        sub.once('confirmed', async (payment) => {
            await prisma.lnWithdrawal.update({
                where: { k1: input.k1 },
                data: { withdrawalId: withdrawal?.id },
            })
        })

        return withdrawal
    },
})
