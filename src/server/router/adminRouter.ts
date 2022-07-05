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
    .mutation('softDeleteCommentById', {
        input: z.object({
            commentId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            return await ctx.prisma.comment.update({
                where: { id: input.commentId },
                data: { contentStatus: 'SOFT_DELETED' },
            })
        },
    })
    .mutation('deleteCommentById', {
        input: z.object({
            commentId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            return await ctx.prisma.comment.delete({ where: { id: input.commentId } })
        },
    })
    .mutation('softDeletePostById', {
        input: z.object({
            posyId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            return await ctx.prisma.post.update({
                where: { id: input.posyId },
                data: { contentStatus: 'SOFT_DELETED' },
            })
        },
    })
    .mutation('deletePostById', {
        input: z.object({
            posyId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            return await ctx.prisma.post.delete({ where: { id: input.posyId } })
        },
    })
