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
                        invoices: true,
                        withdrawalsFinal: true,
                    },
                })
                .then((user) => {
                    const paidIn = user?.invoices
                        .filter((invoice) => invoice.confirmedAt)
                        .reduce((acc, cur) => acc + (cur?.mSatsReceived ?? 0), 0)
                    const paidOut = user?.withdrawalsFinal
                        .filter((withdrawal) => withdrawal.status === 'CONFIRMED')
                        .reduce((acc, cur) => acc + (cur?.mSatsPaid ?? 0), 0)
                    return {
                        ...user,
                        totalContributions: user!.contentItems.length,
                        balance: paidIn ? paidIn - (paidOut ?? 0) : 0,
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
                    include: {
                        contentItems: true,
                        invoices: true,
                        withdrawalsFinal: true,
                        mentionedUsersOnContentItems: true,
                    },
                })
                .then((user) => {
                    const paidIn = user?.invoices
                        .filter((invoice) => invoice.confirmedAt)
                        .reduce((acc, cur) => acc + (cur?.mSatsReceived ?? 0), 0)
                    const paidOut = user?.withdrawalsFinal
                        .filter((withdrawal) => withdrawal.status === 'CONFIRMED')
                        .reduce((acc, cur) => acc + (cur?.mSatsPaid ?? 0), 0)
                    return {
                        ...user,
                        totalContributions: user!.contentItems.length,
                        balance: paidIn ? paidIn - (paidOut ?? 0) : 0,
                        totalMentioned: user!.mentionedUsersOnContentItems.length,
                    }
                })
                .catch((e) => {
                    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'auth failed' })
                })
        },
    })
    .query('myBalance', {
        resolve: async ({ ctx }) => {
            return await ctx.prisma.user
                .findUnique({
                    where: { id: ctx?.user?.id },
                    include: { invoices: true, withdrawalsFinal: true },
                })
                .then((user) => {
                    const paidIn = user?.invoices
                        .filter((invoice) => invoice.confirmedAt)
                        .reduce((acc, cur) => acc + (cur?.mSatsReceived ?? 0), 0)
                    const paidOut = user?.withdrawalsFinal
                        .filter((withdrawal) => withdrawal.status === 'CONFIRMED')
                        .reduce((acc, cur) => acc + (cur?.mSatsPaid ?? 0), 0)
                    return (paidIn ? paidIn - (paidOut ?? 0) : 0) / 1000
                })
                .catch((e) => {
                    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'auth failed' })
                })
        },
    })
