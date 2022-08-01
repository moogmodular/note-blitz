import { createInvoice, getChainBalance, getInvoice, getWalletInfo, subscribeToInvoice } from 'lightning'

import { createRouter } from './context'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { encodedUrl, k1, lnurlPayDescriptionHash } from '../services/lnurl'
import { PrismaClient } from '@prisma/client'
import { format } from 'date-fns'

const INVOICE_LIMIT = 10

export async function belowInvoiceLimit(prisma: PrismaClient, userId: string) {
    const count = await prisma.invoice.count({
        where: {
            userId,
            expiresAt: {
                gt: new Date(),
            },
            confirmedAt: null,
            cancelled: false,
        },
    })

    return count < INVOICE_LIMIT
}

export const lightningRouter = createRouter()
    .mutation('nodeBalance', {
        async resolve({ ctx }) {
            const lnd = ctx.lnd
            const chainBalance = await getChainBalance({ lnd })
                .then((res) => res.chain_balance)
                .catch((e) => {
                    console.log(e)
                })
            return chainBalance
        },
    })
    .query('nodeConnection', {
        async resolve({ ctx }) {
            const lnd = ctx.lnd
            const walletInfo = (await getWalletInfo({ lnd })) as unknown as { uris: string[] }
            const uri = walletInfo.uris[0] as string
            return uri
        },
    })
    .query('getWithdrawalUrl', {
        resolve: async ({ ctx }) => {
            if (!ctx?.user) {
                throw new TRPCError({ code: 'UNAUTHORIZED' })
            }

            const lnWithdrawal = await ctx.prisma.lnWithdrawal.create({ data: { k1: k1(), userId: ctx?.user.id } })

            const encoded = encodedUrl(
                process.env.LN_WITH_URL ?? 'https://localhost:3000/api/lnwith',
                'withdrawRequest',
                lnWithdrawal.k1,
            )

            return { ...lnWithdrawal, encoded }
        },
    })
    .query('wasWithdrawalSettled', {
        input: z.object({
            k1: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            return await ctx.prisma.lnWithdrawal.findUnique({ where: { k1: input.k1 } })
        },
    })
    .query('isInvoicePaid', {
        input: z.object({
            lndId: z.string(),
            hash: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const lnd = ctx.lnd
            let inv
            try {
                inv = await getInvoice({ id: input.lndId, lnd })
            } catch (err) {
                console.log(err)
                return
            }

            if (inv.is_confirmed) {
                return await ctx.prisma.invoice
                    .update({
                        where: { lndId: inv.id },
                        data: { mSatsReceived: Number(inv.received_mtokens), confirmedAt: new Date() },
                    })
                    .catch(console.log)
            } else if (inv.is_canceled) {
                return await ctx.prisma.invoice.update({
                    where: {
                        hash: inv.id,
                    },
                    data: {
                        cancelled: true,
                    },
                })
            }
        },
    })
    .query('createInvoice', {
        input: z.object({
            amount: z.number(),
        }),
        resolve: async ({ ctx, input }) => {
            const lnd = ctx.lnd
            console.log(input)
            if (!ctx?.user) {
                throw new TRPCError({ code: 'UNAUTHORIZED' })
            }

            if (!input.amount || input.amount <= 0) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'amount must be positive' })
            }

            const user = await ctx.prisma.user.findUnique({ where: { id: ctx.user.id } })

            if (!(await belowInvoiceLimit(ctx.prisma, ctx.user.id))) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'too many pending invoices' })
            }

            if (input.amount > 100) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'invoice amount too high' })
            }

            // set expires at to 1 hour into future
            const expiresAt = new Date(new Date().setHours(new Date().getHours() + 1))
            const description = `${input.amount} sats for @${user?.userName} on noteblitz.app at ${format(
                new Date(),
                'dd.MM.yyyy hh:mm:ss',
            )}`
            try {
                const invoice = await createInvoice({
                    description,
                    lnd,
                    tokens: input.amount,
                    description_hash: lnurlPayDescriptionHash(description),
                    expires_at: expiresAt.toString(),
                })

                const invoiceSub = await subscribeToInvoice({
                    lnd,
                    id: invoice.id,
                })

                invoiceSub.on('invoice_updated', async (invoice) => {
                    if (invoice.is_confirmed) {
                        return await ctx.prisma.invoice
                            .update({
                                where: { lndId: invoice.id },
                                data: { mSatsReceived: Number(invoice.received_mtokens), confirmedAt: new Date() },
                            })
                            .catch(console.log)
                    } else if (invoice.is_canceled) {
                        return await ctx.prisma.invoice.update({
                            where: {
                                hash: invoice.id,
                            },
                            data: {
                                cancelled: true,
                            },
                        })
                    }
                })

                const inv = await ctx.prisma.invoice.create({
                    data: {
                        expiresAt: expiresAt,
                        lndId: invoice.id,
                        userId: ctx.user.id,
                        mSatsRequested: Number(input.amount) * 1000,
                        hash: lnurlPayDescriptionHash(description),
                        bolt11: invoice.request,
                    },
                })

                return inv
            } catch (error) {
                console.log(error)
                throw error
            }
        },
    })
