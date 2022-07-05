// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { User } from '@prisma/client'
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { Config, adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator'

import { prisma } from '../../../server/db/client'

const mapUser = (user?: User | null) => {
    console.log(user)
    return { ...user, profileImage: '' }
}

export const authOptions: NextAuthOptions = {
    callbacks: {
        async jwt({ token, user, account, profile, isNewUser }) {
            if (user?.id) {
                token.user = user
            }
            return token
        },
        async session({ session, token }) {
            // session.user.id = token.id
            // @ts-ignore
            session.user = token.user as User
            return session
        },
    },
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                pubkey: { label: 'publickey', type: 'text' },
                k1: { label: 'k1', type: 'text' },
            },
            async authorize(credentials, req) {
                const k1 = credentials?.k1
                const pubkey = credentials?.pubkey
                try {
                    const lnAuth = await prisma.lnAuth.findUnique({ where: { k1 } })
                    if (lnAuth!.pubkey === pubkey) {
                        let user = await prisma.user.findUnique({ where: { publicKey: pubkey } })
                        if (!user) {
                            const customConfig: Config = {
                                dictionaries: [adjectives, colors, animals],
                                separator: '',
                                length: 3,
                                style: 'capital',
                            }
                            const randomName: string = uniqueNamesGenerator(customConfig)
                            user = await prisma.user.create({ data: { userName: randomName, publicKey: pubkey } })
                        }
                        await prisma.lnAuth.delete({ where: { k1 } })
                        console.log('user', user)
                        return user
                    }
                } catch (error) {
                    console.log(error)
                }

                return null
            },
        }),
    ],
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 3 * 24 * 60 * 60,
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
        maxAge: 3 * 24 * 60 * 60,
    },
    pages: {
        signIn: '/login',
    },
}

export default NextAuth(authOptions)
