import { z } from 'zod'

import { createRouter } from './context'

export const taxonomyRouter = createRouter()
    .query('getTagInfoByName', {
        input: z.object({
            tagName: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            return await ctx.prisma.tag
                .findUnique({
                    where: { name: input.tagName },
                    include: { contentItems: true },
                })
                .then((tag) => {
                    return {
                        ...tag,
                        contentItemCount: tag!.contentItems.length,
                    }
                })
        },
    })
    .query('getTaxonomyStats', {
        resolve: async ({ ctx }) => {
            const tags = await ctx.prisma.tag.findMany({
                take: 5,
                include: { contentItems: true },
                orderBy: { contentItems: { _count: 'desc' } },
            })
            return tags.map((tag) => {
                return {
                    tagName: tag.name,
                    tagId: tag.id,
                    postCount: tag.contentItems.length,
                }
            })
        },
    })
    .query('searchByName', {
        input: z.object({
            name: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const tags = await ctx.prisma.tag
                .findMany({
                    take: 5,
                    where: { name: { contains: input.name, mode: 'insensitive' } },
                })
                .then((tags) => tags.filter((tag) => !tag.name.toLowerCase().includes('nb')))
            return tags.map((tag) => {
                return {
                    tagName: tag.name,
                    tagId: tag.id,
                }
            })
        },
    })
    .query('getPrivileged', {
        resolve: async ({ ctx, input }) => {
            return await ctx.prisma.tag.findMany({
                where: { privileged: true },
            })
        },
    })
