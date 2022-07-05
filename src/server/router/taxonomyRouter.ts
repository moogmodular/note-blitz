import { z } from 'zod'

import { createRouter } from './context'

export const taxonomyRouter = createRouter()
    .query('getTaxonomyStats', {
        resolve: async ({ ctx }) => {
            const tags = await ctx.prisma.tag.findMany({
                take: 5,
                include: { posts: true },
                orderBy: { posts: { _count: 'desc' } },
            })
            return tags.map((tag) => {
                return {
                    tagName: tag.name,
                    tagId: tag.id,
                    postCount: tag.posts.length,
                }
            })
        },
    })
    .query('searchByName', {
        input: z.object({
            name: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const tags = await ctx.prisma.tag.findMany({
                take: 5,
                where: { name: { contains: input.name, mode: 'insensitive' } },
            })
            return tags.map((tag) => {
                return {
                    tagName: tag.name,
                    tagId: tag.id,
                }
            })
        },
    })
