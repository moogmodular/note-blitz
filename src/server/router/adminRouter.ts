import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createRouter } from './context'

export const adminRouter = createRouter()
    .middleware(async ({ ctx, next }) => {
        if (ctx?.user?.role !== 'ADMIN') {
            throw new TRPCError({ code: 'UNAUTHORIZED' })
        }
        return next()
    })
    .mutation('softDeletePostById', {
        input: z.object({
            contentItemId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            return await ctx.prisma.contentItem.update({
                where: { id: input.contentItemId },
                data: { contentStatus: 'SOFT_DELETED' },
            })
        },
    })
    .mutation('deletePostById', {
        input: z.object({
            contentItemId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            return await ctx.prisma.contentItem.delete({ where: { id: input.contentItemId } })
        },
    })
