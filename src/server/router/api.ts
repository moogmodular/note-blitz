import { z } from 'zod'

import { createRouter } from './context'

export const apiRouter = createRouter()
    .query('version', {
        resolve() {
            return { version: '0.42.0' }
        },
    })
    .query('hello', {
        input: z
            .object({
                username: z.string().nullish(),
            })
            .nullish(),
        resolve({ input, ctx }) {
            return {
                text: `hello world`,
            }
        },
    })
