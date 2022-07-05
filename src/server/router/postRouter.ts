import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { slugify } from '../../utils/string.service'
import { extractMentionsFromDelta } from '../../utils/taxonomy.service'
import { createRouter } from './context'

const postMapper = (posts: any) =>
    posts.map((post: any) => {
        const author = post.author
        return {
            ...post,
            content: post.contentStatus === 'SOFT_DELETED' ? 'DELETED' : post.content,
            excerpt: post.contentStatus === 'SOFT_DELETED' ? 'DELETED' : post.excerpt,
            tags: post.tags.map((tag: any) => {
                return {
                    tag: tag.tag!.name,
                    tagId: tag.tagId,
                }
            }),
            authorPublicKey: author!.publicKey.slice(0, 10),
            author: author!.userName,
            commentAmount: post.comments.length,
        }
    })

export const postRouter = createRouter()
    .query('getPostBySlug', {
        input: z.object({
            slug: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const post = await ctx.prisma.post.findUnique({
                where: {
                    slug: input.slug,
                },
            })
            const content = post!.content as Prisma.JsonObject
            return {
                ...post,
                content: {
                    htmlContent: post!.contentStatus === 'SOFT_DELETED' ? '<div>DELETED</div>' : content.htmlContent,
                    deltaContent: post!.contentStatus === 'SOFT_DELETED' ? {} : content.deltaContent,
                },
            }
        },
    })
    .query('getPostById', {
        input: z.object({
            postId: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const post = await ctx.prisma.post.findUnique({
                where: {
                    id: input.postId,
                },
                include: {
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                    author: true,
                },
            })

            const content = post!.content as Prisma.JsonObject

            return {
                ...post,
                content: {
                    htmlContent: post!.contentStatus === 'SOFT_DELETED' ? '<div>DELETED</div>' : content.htmlContent,
                    deltaContent: post!.contentStatus === 'SOFT_DELETED' ? {} : content.deltaContent,
                },
            }
        },
    })
    .query('getPostsByUser', {
        input: z.object({
            userName: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const posts = await ctx.prisma.user
                .findUnique({
                    where: { userName: input.userName },
                    include: {
                        posts: {
                            include: {
                                comments: true,
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
                .then((usr) => usr!.posts)
            return postMapper(posts)
        },
    })
    .query('getPostsByTag', {
        input: z.object({
            tag: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const posts = await ctx.prisma.tagsOnPosts
                .findMany({
                    where: {
                        tag: {
                            name: input.tag,
                        },
                    },
                    include: {
                        post: {
                            include: {
                                comments: true,
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
                .then((tagsOnPosts) => tagsOnPosts.map((tagsOnPost) => tagsOnPost.post))
            return postMapper(posts)
        },
    })
    .query('getAll', {
        resolve: async ({ ctx }) => {
            const posts = await ctx.prisma.post.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    comments: true,
                    author: true,
                    tags: {
                        include: {
                            tag: true,
                        },
                    },
                },
            })

            return postMapper(posts)
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

            return await ctx.prisma.post.create({
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
            return await ctx.prisma.post.findMany({
                where: {
                    author: {
                        id: ctx?.user?.id as string,
                    },
                },
            })
        },
    })
