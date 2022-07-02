import { IncomingMessage } from 'http'

import { PrismaClient } from '@prisma/client'
import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import { NodeHTTPCreateContextFnOptions } from '@trpc/server/adapters/node-http'
import { User } from 'next-auth'
import { getSession } from 'next-auth/react'
import ws from 'ws'

import { lnUrlService } from './services/lightning'
import { lnd } from './services/lnd'

export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

export const createContext = async ({
    req,
    res,
}: trpcNext.CreateNextContextOptions | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>) => {
    const session = await getSession({ req })
    const user = session?.user as User
    return {
        req,
        res,
        user,
        prisma,
        lnd,
        lnUrlService,
        session,
    }
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>
