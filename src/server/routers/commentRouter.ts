import { clearInterval } from 'timers'

import { Prisma } from '@prisma/client'
import { Subscription, TRPCError } from '@trpc/server'
import { z } from 'zod'

import { extractMentionsFromDelta } from '../../utils/taxonomy.service'
import { createRouter } from '../createRouter'

export const commentRouter = createRouter()
    .query('getForPostById', {
        input: z.object({
            postId: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const comments = await ctx.prisma.comment.findMany({
                where: {
                    AND: [
                        {
                            post: {
                                id: input.postId,
                            },
                        },
                        {
                            parent: null,
                        },
                    ],
                },
                include: {
                    author: true,
                },
            })

            return comments.map((comment) => {
                const content = comment!.content as Prisma.JsonObject
                return {
                    ...comment,
                    content: {
                        htmlContent:
                            comment!.contentStatus === 'SOFT_DELETED' ? '<div>DELETED</div>' : content.htmlContent,
                        deltaContent: comment!.contentStatus === 'SOFT_DELETED' ? {} : content.deltaContent,
                    },
                }
            })
        },
    })
    .query('getTreeByCommentId', {
        input: z.object({
            commentId: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const lookup = async (comment: any): Promise<any> => {
                const children = await ctx.prisma.comment.findMany({
                    where: { parentId: comment.id },
                    include: { author: true },
                })

                const content = comment!.content as Prisma.JsonObject

                return {
                    ...comment,
                    content: {
                        htmlContent:
                            comment!.contentStatus === 'SOFT_DELETED' ? '<div>DELETED</div>' : content.htmlContent,
                        deltaContent: comment!.contentStatus === 'SOFT_DELETED' ? {} : content.deltaContent,
                    },
                    children: children ? await Promise.all(children.map(async (child) => await lookup(child))) : null,
                }
            }

            const comment = await ctx.prisma.comment.findUnique({
                where: { id: input.commentId },
                include: { author: true },
            })

            return await lookup(comment)
        },
    })
    .mutation('replyToPost', {
        input: z.object({
            postId: z.string(),
            title: z.string(),
            content: z.object({
                htmlContent: z.string(),
                deltaContent: z.any(),
            }),
        }),
        resolve: async ({ input, ctx }) => {
            if (!ctx?.user?.id) {
                throw new TRPCError({ code: 'UNAUTHORIZED' })
            }

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

            return await ctx.prisma.comment
                .create({
                    data: {
                        postId: input.postId,
                        authorId: ctx.user.id,
                        title: input.title,
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
                        content: { htmlContent: input.content.htmlContent, deltaContent: input.content.deltaContent },
                    },
                })
                .catch((reason) => console.log(reason))
        },
    })
    .mutation('replyToComment', {
        input: z.object({
            commentId: z.string(),
            title: z.string(),
            content: z.object({
                htmlContent: z.string(),
                deltaContent: z.any(),
            }),
        }),
        resolve: async ({ input, ctx }) => {
            if (!ctx?.user?.id) {
                throw new TRPCError({ code: 'UNAUTHORIZED' })
            }

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

            const parentComment = await ctx.prisma.comment.findUnique({ where: { id: input.commentId } })

            return await ctx.prisma.comment
                .create({
                    data: {
                        parentId: input.commentId,
                        authorId: ctx.user.id,
                        title: input.title,
                        postId: parentComment!.postId,
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
                        content: { htmlContent: input.content.htmlContent, deltaContent: input.content.deltaContent },
                    },
                })
                .catch((reason) => console.log(reason))
        },
    })
    .subscription('commentCreatedForPost', {
        input: z.object({
            postId: z.string(),
        }),
        resolve() {
            return new Subscription<number>((emit) => {
                const int = setInterval(() => {
                    emit.data(Math.random())
                }, 500)
                return () => {
                    clearInterval(int)
                }
            })
        },
    })
