import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createRouter } from '../createRouter'

export const adminRouter = createRouter()
    .mutation('softDeleteCommentById', {
        input: z.object({
            commentId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            if (!ctx?.user?.id || ctx?.user?.role !== 'ADMIN') {
                throw new TRPCError({ code: 'UNAUTHORIZED' })

                return []
            }

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
            if (!ctx?.user?.id || ctx?.user?.role !== 'ADMIN') {
                throw new TRPCError({ code: 'UNAUTHORIZED' })

                return []
            }

            return await ctx.prisma.comment.delete({ where: { id: input.commentId } })
        },
    })
    .mutation('softDeletePostById', {
        input: z.object({
            posyId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            if (!ctx?.user?.id || ctx?.user?.role !== 'ADMIN') {
                throw new TRPCError({ code: 'UNAUTHORIZED' })

                return []
            }

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
            if (!ctx?.user?.id || ctx?.user?.role !== 'ADMIN') {
                throw new TRPCError({ code: 'UNAUTHORIZED' })

                return []
            }

            return await ctx.prisma.post.delete({ where: { id: input.posyId } })
        },
    })
