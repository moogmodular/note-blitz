import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { slugify } from '../../utils/string.service'
import { extractMentionsFromDelta } from '../../utils/taxonomy.service'
import { createRouter } from './context'

const contentItemMapper = (contentItems: any) =>
    contentItems.map((contentItem: any) => {
        const author = contentItem.author
        return {
            ...contentItem,
            earned: contentItem.relatedTransactions.reduce(
                (acc: number, cur: { amount: number }) => acc + cur.amount,
                0,
            ),
            content: contentItem.contentStatus === 'SOFT_DELETED' ? 'DELETED' : contentItem.content,
            excerpt: contentItem.contentStatus === 'SOFT_DELETED' ? 'DELETED' : contentItem.excerpt,
            tags: contentItem.tags.map((tag: any) => {
                return {
                    tag: tag.tag!.name,
                    tagId: tag.tagId,
                }
            }),
            replyCount: contentItem.contentItemSourceChildren ? contentItem.contentItemSourceChildren.length : null,
            authorPublicKey: author!.publicKey.slice(0, 10),
            author: author!.userName,
        }
    })

export const contentItemRouter = createRouter()
    .query('getBySlug', {
        input: z.object({
            slug: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const contentItem = await ctx.prisma.contentItem.findUnique({
                where: {
                    slug: input.slug,
                },
                include: {
                    relatedTransactions: true,
                },
            })
            const content = contentItem!.content as Prisma.JsonObject
            return {
                ...contentItem,
                earned: contentItem!.relatedTransactions.reduce((acc, cur) => acc + cur.amount, 0),
                content: {
                    htmlContent:
                        contentItem!.contentStatus === 'SOFT_DELETED' ? '<div>DELETED</div>' : content.htmlContent,
                    deltaContent: contentItem!.contentStatus === 'SOFT_DELETED' ? {} : content.deltaContent,
                },
            }
        },
    })
    .query('getById', {
        input: z.object({
            contentItemId: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const contentItem = await ctx.prisma.contentItem.findUnique({
                where: {
                    id: input.contentItemId,
                },
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                    relatedTransactions: true,
                    author: true,
                },
            })

            const content = contentItem!.content as Prisma.JsonObject

            return {
                ...contentItem,
                earned: contentItem!.relatedTransactions.reduce((acc, cur) => acc + cur.amount, 0),
                content: {
                    htmlContent:
                        contentItem!.contentStatus === 'SOFT_DELETED' ? '<div>DELETED</div>' : content.htmlContent,
                    deltaContent: contentItem!.contentStatus === 'SOFT_DELETED' ? {} : content.deltaContent,
                },
            }
        },
    })
    .query('getByUser', {
        input: z.object({
            userName: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const contentItems = await ctx.prisma.user
                .findUnique({
                    where: { userName: input.userName },
                    include: {
                        contentItems: {
                            where: { parentId: null },
                            include: {
                                children: true,
                                author: true,
                                tags: {
                                    include: {
                                        tag: true,
                                    },
                                },
                                relatedTransactions: true,
                            },
                        },
                    },
                })
                .then((usr) => usr!.contentItems)
            return contentItemMapper(contentItems)
        },
    })
    .query('getByTag', {
        input: z.object({
            tag: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const contentItems = await ctx.prisma.tagsOnContentItems
                .findMany({
                    where: {
                        tag: {
                            name: input.tag,
                        },
                    },
                    include: {
                        contentItem: {
                            include: {
                                relatedTransactions: true,
                                children: true,
                                author: true,
                                tags: {
                                    include: {
                                        tag: true,
                                    },
                                },
                            },
                        },
                    },
                })
                .then((tagsOnPosts) =>
                    tagsOnPosts.map((tagsOnPost) => tagsOnPost.contentItem).filter((ci) => ci.parentId === null),
                )
            return contentItemMapper(contentItems)
        },
    })
    .query('getOpList', {
        resolve: async ({ ctx }) => {
            const contentItems = await ctx.prisma.contentItem.findMany({
                where: {
                    parentId: null,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    author: true,
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                    contentItemSourceChildren: true,
                    relatedTransactions: true,
                },
            })

            return contentItemMapper(contentItems)
        },
    })
    .query('getTreeById', {
        input: z.object({
            contentItemId: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const lookup = async (contentItem: any): Promise<any> => {
                const children = await ctx.prisma.contentItem.findMany({
                    where: { parentId: contentItem.id },
                    include: { author: true, relatedTransactions: true },
                })

                const content = contentItem!.content as Prisma.JsonObject

                return {
                    ...contentItem,
                    earned: contentItem!.relatedTransactions.reduce(
                        (acc: number, cur: { amount: number }) => acc + cur.amount,
                        0,
                    ),
                    content: {
                        htmlContent:
                            contentItem!.contentStatus === 'SOFT_DELETED' ? '<div>DELETED</div>' : content.htmlContent,
                        deltaContent: contentItem!.contentStatus === 'SOFT_DELETED' ? {} : content.deltaContent,
                    },
                    children: children ? await Promise.all(children.map(async (child) => await lookup(child))) : null,
                }
            }

            const contentItem = await ctx.prisma.contentItem.findUnique({
                where: { id: input.contentItemId },
                include: { author: true, relatedTransactions: true },
            })

            return await lookup(contentItem)
        },
    })
    .middleware(async ({ ctx, next }) => {
        if (!ctx?.user) {
            throw new TRPCError({ code: 'UNAUTHORIZED' })
        }
        return next()
    })
    .mutation('create', {
        input: z.object({
            title: z.string(),
            headerImage: z.string(),
            excerpt: z.string(),
            content: z.object({
                htmlContent: z.string(),
                deltaContent: z.any(),
            }),
        }),
        resolve: async ({ input, ctx }) => {
            const { mentionedTags, mentionedUsers } = extractMentionsFromDelta(input.content.deltaContent)

            const containsPrivileged = mentionedTags.some((tag) => tag.value.startsWith('nb'))

            if (containsPrivileged && ctx?.user?.role !== 'ADMIN') {
                throw new TRPCError({ code: 'FORBIDDEN' })
            }

            const allNewTags = await Promise.all(
                mentionedTags.map(async (tag) => {
                    const existingTag = await ctx.prisma.tag.findUnique({ where: { name: tag.value } })

                    if (existingTag) {
                        return existingTag
                    }

                    const isPrivileged = tag.value.startsWith('nb')

                    return await ctx.prisma.tag.create({ data: { name: tag.value, privileged: isPrivileged } })
                }),
            )

            const allMentionedUsers = await Promise.all(
                mentionedUsers.map(async (user) => {
                    return await ctx.prisma.user.findUnique({ where: { userName: user.value } })
                }),
            )

            return await ctx.prisma.contentItem.create({
                data: {
                    authorId: ctx?.user?.id as string,
                    headerImage: input.headerImage,
                    title: input.title,
                    slug: slugify(input.title),
                    mentionedUsers: {
                        createMany: {
                            data: allMentionedUsers.map((usr) => {
                                return {
                                    userId: usr!.id,
                                }
                            }),
                        },
                    },
                    tags: {
                        createMany: {
                            data: allNewTags.map((tag) => {
                                return {
                                    tagId: tag!.id,
                                }
                            }),
                        },
                    },
                    excerpt: input.excerpt,
                    content: { htmlContent: input.content.htmlContent, deltaContent: input.content.deltaContent },
                },
            })
        },
    })
    .query('getMine', {
        resolve: async ({ ctx }) => {
            return await ctx.prisma.contentItem.findMany({
                where: {
                    author: {
                        id: ctx?.user?.id as string,
                    },
                },
            })
        },
    })
    .mutation('replyTo', {
        input: z.object({
            contentItemId: z.string(),
            title: z.string(),
            content: z.object({
                htmlContent: z.string(),
                deltaContent: z.any(),
            }),
        }),
        resolve: async ({ input, ctx }) => {
            const { mentionedTags, mentionedUsers } = extractMentionsFromDelta(input.content.deltaContent)

            const allNewTags = await Promise.all(
                mentionedTags.map(async (tag) => {
                    const existingTag = await ctx.prisma.tag.findUnique({ where: { name: tag.value } })

                    if (existingTag) {
                        return existingTag
                    }
                    return await ctx.prisma.tag.create({ data: { name: tag.value } })
                }),
            )

            const allMentionedUsers = await Promise.all(
                mentionedUsers.map(async (user) => {
                    return await ctx.prisma.user.findUnique({ where: { userName: user.value } })
                }),
            )

            const parentContentItem = await ctx.prisma.contentItem.findUnique({
                where: { id: input.contentItemId },
                include: { contentItemSource: true },
            })

            const newContentItem = await ctx.prisma.contentItem.create({
                data: {
                    title: input.title,
                    content: { htmlContent: input.content.htmlContent, deltaContent: input.content.deltaContent },
                    parent: { connect: { id: input.contentItemId as string } },
                    author: { connect: { id: ctx?.user?.id as string } },
                    mentionedUsers: {
                        createMany: {
                            data: allMentionedUsers.map((usr) => {
                                return {
                                    userId: usr!.id,
                                }
                            }),
                        },
                    },
                    tags: {
                        createMany: {
                            data: allNewTags.map((tag) => {
                                return {
                                    tagId: tag!.id,
                                }
                            }),
                        },
                    },
                },
            })

            return await ctx.prisma.contentItem
                .update({
                    where: { id: newContentItem!.id },
                    data: {
                        contentItemSource: {
                            connect: {
                                id: parentContentItem!.parentId
                                    ? parentContentItem!.contentItemSource?.id
                                    : parentContentItem!.id,
                            },
                        },
                    },
                })
                .catch((reason) => console.log(reason))
        },
    })
