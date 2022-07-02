import NextAuth from 'next-auth'
import { AppProviders } from 'next-auth/providers'
import CredentialsProvider from 'next-auth/providers/credentials'

import { prisma } from '../../../server/context'

const providers: AppProviders = []
providers.push(
    CredentialsProvider({
        name: 'Lightning',
        credentials: {
            k1: { label: 'secret', type: 'text' },
        },
        async authorize(credentials, req) {
            try {
                const lnAuth = await prisma.lnAuth.findUnique({
                    where: { k1: credentials!.k1 },
                    include: { user: true },
                })
                const user = lnAuth!.user
                return {
                    id: user!.id,
                    role: user!.role,
                    lastLogin: user!.lastLogin,
                    publicKey: user!.publicKey,
                    userName: user!.userName,
                }
            } catch (error) {
                console.log(error)
            }
            return null
        },
    }),
)
export default NextAuth({
    session: {
        strategy: 'jwt',
        maxAge: 3 * 24 * 60 * 60,
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
        maxAge: 3 * 24 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, user, account, profile, isNewUser }) {
            if (user) {
                token.user = user
            }
            return token
        },
        async session({ session, user, token }) {
            // @ts-ignore
            session.user = token.user
            return session
        },
    },
    providers,
})
