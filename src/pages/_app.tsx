import '../../styles/global.css'

import { httpBatchLink } from '@trpc/client/links/httpBatchLink'
import { loggerLink } from '@trpc/client/links/loggerLink'
import { createWSClient, wsLink } from '@trpc/client/links/wsLink'
import { withTRPC } from '@trpc/next'
import { SessionProvider, getSession } from 'next-auth/react'
import getConfig from 'next/config'
import { AppType } from 'next/dist/shared/lib/utils'
import type { AppRouter } from 'server/routers/_app'
import superjson from 'superjson'

const { publicRuntimeConfig } = getConfig()

const { APP_URL, WS_URL } = publicRuntimeConfig

const MyApp: AppType = ({ Component, pageProps }) => {
    return (
        <SessionProvider session={pageProps.session}>
            <Component {...pageProps} />
        </SessionProvider>
    )
}

MyApp.getInitialProps = async ({ ctx }) => {
    return {
        pageProps: {
            session: await getSession(ctx),
        },
    }
}

export function getEndingLink() {
    if (typeof window === 'undefined') {
        return httpBatchLink({
            url: `${APP_URL}/api/trpc`,
        })
    }
    const client = createWSClient({
        url: WS_URL,
    })
    return wsLink<AppRouter>({
        client,
    })
}

export default withTRPC<AppRouter>({
    config({ ctx }) {
        return {
            links: [
                // adds pretty logs to your console in development and logs errors in production
                loggerLink({
                    enabled: (opts) =>
                        (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') ||
                        (opts.direction === 'down' && opts.result instanceof Error),
                }),
                getEndingLink(),
            ],
            transformer: superjson,
            queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
            headers: () => {
                if (ctx?.req) {
                    // on ssr, forward client's headers to the server
                    return {
                        ...ctx.req.headers,
                        'x-ssr': '1',
                    }
                }
                return {}
            },
        }
    },
    ssr: true,
})(MyApp)
