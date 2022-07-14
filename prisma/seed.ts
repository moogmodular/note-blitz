import { faker } from '@faker-js/faker'
import { Prisma, PrismaClient } from '@prisma/client'

import { slugify } from '../src/utils/string.service'
import { commentSeed } from './seed/comment.seed'
import { contentItemSeed } from './seed/contentItemSeed'
import { imageMock } from './seed/image.seed'
import { tagsMock } from './seed/tag.seed'
import { usersMock } from './seed/user.seed'
import { walletSeed } from './seed/wallet.seed'

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
        await prisma.tagsOnContentItems.deleteMany(),
        await prisma.mentionedUsersOnContentItems.deleteMany(),
        await prisma.contentItem.deleteMany(),
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
        walletSeed.map(async (wallet) => {
            await prisma.wallet.create({ data: wallet })
        }),
    )

    await Promise.all(
        usersMock.map(async (user) => {
            const contentItems = [...Array(getRandomInt(1, 6))].map((value, index) => {
                const title = faker.lorem.sentence(10)
                return {
                    headerImage: imageMock,
                    slug: slugify(title),
                    content: {
                        htmlContent: contentItemSeed.content.htmlContent,
                        deltaContent: contentItemSeed.content.deltaContent,
                    },
                    excerpt: contentItemSeed.excerpt,
                    contentStatus: 'PUBLISHED',
                    title: title,
                } as Prisma.ContentItemCreateManyAuthorInput
            })

            await prisma.user.create({ data: { ...user, contentItems: { createMany: { data: contentItems } } } })
        }),
    )

    const allContentItems = await prisma.contentItem.findMany({})

    await Promise.all(
        allContentItems.map(async (contentItem) => {
            const allTags = await prisma.tag.findMany({})
            const tagCandidates = getRandomElements(allTags)

            await Promise.all(
                tagCandidates.map(async (tagCandidate) => {
                    await prisma.contentItem.update({
                        where: { id: contentItem.id },
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

    const doContentItemChild = (contentItemId: string) => {
        return {
            content: {
                htmlContent: commentSeed.content.htmlContent,
                deltaContent: commentSeed.content.deltaContent,
            },
            title: faker.lorem.sentence(8),
            authorId: allUsers[getRandomInt(0, allUsers.length - 1)]!.id,
            // contentItemId: contentItemId,
        }
    }

    await Promise.all(
        allContentItems.map(async (contentItem) => {
            const contentItemChildren = [...Array(getRandomInt(1, 6))].map((value, index) => {
                return {
                    contentItemSourceId: contentItem.id,
                    content: {
                        htmlContent: commentSeed.content.htmlContent,
                        deltaContent: commentSeed.content.deltaContent,
                    },
                    title: faker.lorem.sentence(8),
                    authorId: allUsers[getRandomInt(0, allUsers.length - 1)]!.id,
                    // contentItemId: post.id,
                }
            })

            const postRes = await prisma.contentItem.update({
                where: { id: contentItem.id },
                data: {
                    children: {
                        createMany: {
                            data: contentItemChildren,
                        },
                    },
                },
                include: {
                    children: true,
                    tags: true,
                },
            })
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
