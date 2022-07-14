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
    .query('publicInfoByName', {
        input: z.object({
            name: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            return await ctx.prisma.user
                .findUnique({
                    where: { userName: input.name },
                    include: {
                        contentItems: true,
                        transactionReceived: true,
                        transactionSent: true,
                    },
                })
                .then((user) => {
                    return {
                        ...user,
                        totalContributions: user!.contentItems.length,
                        totalEarned: user!.transactionReceived.reduce((acc, cur) => acc + cur.amount, 0),
                    }
                })
        },
    })
    .query('getAll', {
        resolve: async ({ ctx }) => {
            const users = await ctx.prisma.user.findMany({
                take: 5,
                include: { contentItems: true },
                orderBy: { contentItems: { _count: 'desc' } },
            })
            return users.map((user) => {
                return {
                    publicKey: user.publicKey,
                    createdAt: user.createdAt,
                    id: user.id,
                    userName: user.userName,
                    contentItems: user.contentItems.length,
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
    .mutation('edit', {
        input: z.object({
            userName: z.string().optional(),
            profileImage: z.string().optional(),
            bio: z.string().optional(),
        }),
        resolve: async ({ ctx, input }) => {
            if (!ctx?.user) {
                throw new TRPCError({ code: 'UNAUTHORIZED' })
            }
            return await ctx.prisma.user.update({
                where: { id: ctx?.user?.id },
                data: { ...input },
            })
        },
    })
    .query('getMe', {
        resolve: async ({ ctx }) => {
            return await ctx.prisma.user
                .findUnique({
                    where: { id: ctx?.user?.id },
                    include: { contentItems: true, transactionReceived: true, mentionedUsersOnContentItems: true },
                })
                .then((user) => {
                    return {
                        ...user,
                        totalContributions: user!.contentItems.length,
                        totalEarned: user!.transactionReceived.reduce((acc, cur) => acc + cur.amount, 0),
                        totalMentioned: user!.mentionedUsersOnContentItems.length,
                    }
                })
                .catch((e) => {
                    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'auth failed' })
                })
        },
    })
