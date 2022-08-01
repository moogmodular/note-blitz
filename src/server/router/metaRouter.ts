import { createRouter } from './context'

export const metaRouter = createRouter()
    .query('totalUsers', {
        resolve({ ctx }) {
            return ctx.prisma.user.count()
        },
    })
    .query('totalContributions', {
        resolve({ ctx }) {
            return ctx.prisma.contentItem.count()
        },
    })
    .query('totalTags', {
        resolve({ ctx }) {
            return ctx.prisma.tag.count()
        },
    })
    .query('totalTransactions', {
        async resolve({ ctx }) {
            const invoices = await ctx.prisma.invoice.count()
            const withdrawals = await ctx.prisma.withdrawal.count()

            const invoicesConfirmedValue = await ctx.prisma.invoice
                .findMany({
                    where: {
                        confirmedAt: {
                            not: null,
                        },
                    },
                })
                .then((invoices) => invoices.reduce((acc, cur) => acc + (cur?.mSatsReceived ?? 0), 0))

            return {
                transactionCount: invoices + withdrawals,
                transactionValue: invoicesConfirmedValue,
            }
        },
    })
