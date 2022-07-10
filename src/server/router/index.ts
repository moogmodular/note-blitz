import superjson from 'superjson'

import { adminRouter } from './adminRouter'
import { apiRouter } from './api'
import { authRouter } from './authRouter'
import { commentRouter } from './commentRouter'
import { createRouter } from './context'
import { lightningRouter } from './lightningRouter'
import { postRouter } from './postRouter'
import { taxonomyRouter } from './taxonomyRouter'
import { userRouter } from './userRouter'

export const appRouter = createRouter()
    .transformer(superjson)
    .merge('auth:', authRouter)
    .merge('admin:', adminRouter)
    .merge('lightning:', lightningRouter)
    .merge('post:', postRouter)
    .merge('comment:', commentRouter)
    .merge('taxonomy:', taxonomyRouter)
    .merge('user:', userRouter)
    .merge(apiRouter)

// export type definition of API
export type AppRouter = typeof appRouter