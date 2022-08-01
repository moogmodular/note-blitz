import superjson from 'superjson'

import { adminRouter } from './adminRouter'
import { authRouter } from './authRouter'
import { contentItemRouter } from './contentItemRouter'
import { createRouter } from './context'
import { lightningRouter } from './lightningRouter'
import { metaRouter } from './metaRouter'
import { taxonomyRouter } from './taxonomyRouter'
import { userRouter } from './userRouter'
import { walletRouter } from './walletRouter'
import { generateOpenApiDocument } from 'trpc-openapi'

export const appRouter = createRouter()
    .transformer(superjson)
    .merge('auth:', authRouter)
    .merge('admin:', adminRouter)
    .merge('lightning:', lightningRouter)
    .merge('contentItem:', contentItemRouter)
    .merge('taxonomy:', taxonomyRouter)
    .merge('user:', userRouter)
    .merge('wallet:', walletRouter)
    .merge('meta:', metaRouter)

// export type definition of API
export type AppRouter = typeof appRouter

export const openApiDocument = generateOpenApiDocument(appRouter, {
    title: 'tRPC OpenAPI',
    version: '1.0.0',
    baseUrl: `https://${process.env.DOMAIN}:3000/api`,
})
