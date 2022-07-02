import crypto from 'crypto'

import { z } from 'zod'

import { prisma } from '../context'
import { createRouter } from '../createRouter'

export const authRouter = createRouter()
    .query('getLoginUrl', {
        resolve: async ({ ctx }) => {
            return await ctx.lnUrlService
                .generateNewUrl('login')
                .then((result: { encoded: any; secret: any; url: any }) => {
                    return result as { encoded: any; secret: any; url: any }
                })
                .catch((error: any) => {
                    console.error(error)
                })
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
            const incomingSecretHex = Buffer.from(input.secret, 'hex')
            const incomingHash = crypto.createHash('sha256').update(incomingSecretHex).digest('hex')

            const login = await prisma.lnAuth.findUnique({ where: { k1: incomingHash }, include: { user: true } })

            if (!login) {
                return null
            }

            return login.k1
        },
    })
