import { createRouter } from './context'

export const walletRouter = createRouter().query('getRankedList', {
    resolve: async ({ ctx }) => {
        return await ctx.prisma.wallet.findMany({
            orderBy: {
                rank: 'asc',
            },
        })
    },
})
