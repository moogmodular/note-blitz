import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createRouter } from './context'

export const userRouter = createRouter()
    .query('searchByName', {
        input: z.object({
            name: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            return await ctx.prisma.user.findMany({
                take: 5,
                where: { userName: { contains: input.name, mode: 'insensitive' } },
            })
        },
    })
    .query('getAll', {
        resolve: async ({ ctx }) => {
            const users = await ctx.prisma.user.findMany({
                take: 5,
                include: { posts: true },
                orderBy: { posts: { _count: 'desc' } },
            })
            return users.map((user) => {
                return {
                    publicKey: user.publicKey,
                    createdAt: user.createdAt,
                    id: user.id,
                    userName: user.userName,
                    posts: user.posts.length,
                }
            })
        },
    })
    .query('getUserByName', {
        input: z.object({
            userName: z.string(),
        }),
        resolve: ({ ctx, input }) =>
            ctx.prisma.user.findFirst({
                where: {
                    userName: input.userName,
                },
            }),
    })
    .middleware(async ({ ctx, next }) => {
        if (!ctx?.user) {
            throw new TRPCError({ code: 'UNAUTHORIZED' })
        }
        return next()
    })
    .mutation('edit', {
        input: z.object({
            userName: z.string().optional(),
            profileImage: z.string().optional(),
            bio: z.string().optional(),
        }),
        resolve: async ({ ctx, input }) => {
            return await ctx.prisma.user.update({
                where: { id: ctx?.user?.id },
                data: { ...input },
            })
        },
    })
    .query('getMe', {
        resolve: async ({ ctx }) => {
            return await ctx.prisma.user.findUnique({ where: { id: ctx?.user?.id } })
        },
    })
