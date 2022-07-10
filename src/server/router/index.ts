import superjson from 'superjson'

import { adminRouter } from './adminRouter'
import { metaRouter } from './metaRouter'
import { authRouter } from './authRouter'
import { contentItemRouter } from './contentItemRouter'
import { createRouter } from './context'
import { lightningRouter } from './lightningRouter'
import { taxonomyRouter } from './taxonomyRouter'
import { userRouter } from './userRouter'

export const appRouter = createRouter()
    .transformer(superjson)
    .merge('auth:', authRouter)
    .merge('admin:', adminRouter)
    .merge('lightning:', lightningRouter)
    .merge('contentItem:', contentItemRouter)
    .merge('taxonomy:', taxonomyRouter)
    .merge('user:', userRouter)
    .merge('meta:', metaRouter)

// export type definition of API
export type AppRouter = typeof appRouter
