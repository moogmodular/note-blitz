import { faker } from '@faker-js/faker'
import { Prisma, PrismaClient } from '@prisma/client'

import { slugify } from '../src/utils/string.service'
import { commentSeed } from './seed/comment.seed'
import { imageMock } from './seed/image.seed'
import { postSeed } from './seed/post.seed'
import { tagsMock } from './seed/tag.seed'
import { usersMock } from './seed/user.seed'

const prisma = new PrismaClient()

// a method to generate a random number between two numbers
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

// a method to get a random amount of elements from an array
const getRandomElements = (array: any[]) => {
    const randomAmount = getRandomInt(1, array.length)
    return array.slice(0, randomAmount)
}

async function main() {
    console.log(`start seeding ..., deleting all data`)

    await Promise.all([
        await prisma.tagsOnPosts.deleteMany(),
        await prisma.tagsOnComments.deleteMany(),
        await prisma.mentionedUsersOnComments.deleteMany(),
        await prisma.mentionedUsersOnPosts.deleteMany(),
        await prisma.comment.deleteMany(),
        await prisma.post.deleteMany(),
        await prisma.user.deleteMany(),
        await prisma.tag.deleteMany(),
        await prisma.lnAuth.deleteMany(),
    ])

    console.log(`seed new data`)

    await Promise.all(
        tagsMock.map(async (tag) => {
            await prisma.tag.create({ data: tag })
        }),
    )

    await Promise.all(
        usersMock.map(async (user) => {
            const posts = [...Array(getRandomInt(1, 6))].map((value, index) => {
                const title = faker.lorem.sentence(10)
                return {
                    headerImage: imageMock,
                    slug: slugify(title),
                    content: {
                        htmlContent: postSeed.content.htmlContent,
                        deltaContent: postSeed.content.deltaContent,
                    },
                    excerpt: postSeed.excerpt,
                    contentStatus: 'PUBLISHED',
                    title: title,
                } as Prisma.PostCreateManyAuthorInput
            })

            await prisma.user.create({ data: { ...user, posts: { createMany: { data: posts } } } })
        }),
    )

    const allPosts = await prisma.post.findMany({})

    await Promise.all(
        allPosts.map(async (post) => {
            const allTags = await prisma.tag.findMany({})
            const tagCandidates = getRandomElements(allTags)

            await Promise.all(
                tagCandidates.map(async (tagCandidate) => {
                    await prisma.post.update({
                        where: { id: post.id },
                        data: {
                            tags: {
                                create: {
                                    tagId: tagCandidate.id,
                                },
                            },
                        },
                    })
                }),
            )
        }),
    )

    const allUsers = await prisma.user.findMany({})

    const doComment = (postId: string) => {
        return {
            content: {
                htmlContent: commentSeed.content.htmlContent,
                deltaContent: commentSeed.content.deltaContent,
            },
            title: faker.lorem.sentence(8),
            authorId: allUsers[getRandomInt(0, allUsers.length - 1)].id,
            // postId: postId,
        }
    }

    await Promise.all(
        allPosts.map(async (post) => {
            const comments = [...Array(getRandomInt(1, 6))].map((value, index) => {
                return {
                    content: {
                        htmlContent: commentSeed.content.htmlContent,
                        deltaContent: commentSeed.content.deltaContent,
                    },
                    title: faker.lorem.sentence(8),
                    authorId: allUsers[getRandomInt(0, allUsers.length - 1)].id,
                    // postId: post.id,
                }
            })

            const postRes = await prisma.post.update({
                where: { id: post.id },
                data: {
                    comments: {
                        createMany: {
                            data: comments,
                        },
                    },
                },
                include: {
                    comments: true,
                    tags: true,
                },
            })

            const allComments = await prisma.comment.findMany()

            // await Promise.all(
            //     allComments.map(async (comm) => {
            //         await prisma.comment.update({
            //             where: { id: comm.id },
            //             data: {
            //                 children: {
            //                     createMany: {
            //                         data: [
            //                             { ...doComment(), postId: post.id },
            //                             { ...doComment(), postId: post.id },
            //                         ],
            //                     },
            //                 },
            //             },
            //         })
            //     }),
            // )
        }),
    )

    console.log(`seeding is finished`)
}

main()
    .catch((e) => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
