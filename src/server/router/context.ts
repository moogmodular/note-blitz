import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import { unstable_getServerSession as getServerSession } from 'next-auth'
import { OpenApiMeta } from 'trpc-openapi'

import { authOptions as nextAuthOptions } from '../../pages/api/auth/[...nextauth]'
import { prisma } from '../db/client'
import { lnd } from '../services/lnd'

export const createContext = async (opts?: trpcNext.CreateNextContextOptions) => {
    const req = opts?.req
    const res = opts?.res

    const session = req && res && (await getServerSession(req, res, nextAuthOptions))

    return {
        req,
        res,
        session,
        lnd,
        user: session?.user,
        prisma,
    }
}

type Context = trpc.inferAsyncReturnType<typeof createContext>

export const createRouter = () => trpc.router<Context, OpenApiMeta>()
