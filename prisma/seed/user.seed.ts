import { Prisma } from '@prisma/client'

export const usersMock: Prisma.UserCreateInput[] = [
    {
        publicKey: 'aaaa4354f7b813e79ca59bbbda4412e7c0a0e10c326c9cd36a45e850815bca424b',
        userName: 'PopularBeigeUrial',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
    },
    {
        publicKey: 'bbbb4354f7b813e79ca59bbbda4412e7c0a0e10c326c9cd36a45e850815bca424b',
        userName: 'LegalFuchsiaDuck',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
    },
    {
        publicKey: 'cccc4354f7b813e79ca59bbbda4412e7c0a0e10c326c9cd36a45e850815bca424b',
        userName: 'MainSuperBadger',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
    },
]
