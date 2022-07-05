import crypto from 'crypto'

import { z } from 'zod'

import { encodedUrl, k1 } from '../services/lnurl'
import { createRouter } from './context'

export const authRouter = createRouter()
    .query('getLoginUrl', {
        resolve: async ({ ctx }) => {
            const lnAuth = await ctx.prisma.lnAuth.create({ data: { k1: k1() } })
            const encoded = encodedUrl(
                process.env.LN_AUTH_URL ?? 'http://localhost:3000/api/lnauth',
                'login',
                lnAuth.k1,
            )
            return {
                secret: lnAuth.k1,
                encoded: encoded,
            }
        },
    })
    .query('isSecretLoggedIn', {
        input: z.object({
            secret: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            if (!input.secret) {
                return
            }
            return await ctx.prisma.lnAuth.findUnique({ where: { k1: input.secret } })
        },
    })
