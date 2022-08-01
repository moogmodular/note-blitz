import { z } from 'zod'

import { encodedUrl, k1 } from '../services/lnurl'
import { createRouter } from './context'

export const authRouter = createRouter()
    .query('getLoginUrl', {
        resolve: async ({ ctx }) => {
            const lnAuthentication = await ctx.prisma.lnAuthentication.create({ data: { k1: k1() } })
            const encoded = encodedUrl(
                process.env.LN_AUTH_URL ?? 'http://localhost:3000/api/lnauth',
                'login',
                lnAuthentication.k1,
            )
            return {
                secret: lnAuthentication.k1,
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
            return await ctx.prisma.lnAuthentication.findUnique({ where: { k1: input.secret } })
        },
    })
