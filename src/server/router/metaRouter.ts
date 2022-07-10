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
            return {
                transactionCount: await ctx.prisma.transaction.count(),
                transactionValue: await ctx.prisma.transaction.findMany().then((transactions) => {
                    return transactions.reduce((acc, cur) => acc + cur.amount, 0)
                }),
            }
        },
    })
