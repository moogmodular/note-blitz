/** @type {import('next').NextConfig} */
const nextConfig = {
    serverRuntimeConfig: {
        // Will only be available on the server side
    },
    publicRuntimeConfig: {
        // Will be available on both server and client
        APP_URL: process.env.APP_URL,
        WS_URL: process.env.WS_URL,
    },
    compiler: {
        styledComponents: true,
    },
    reactStrictMode: true,
    async rewrites() {
        return [
            {
                source: '/post/single/:slug',
                destination: '/',
            },
            {
                source: '/post/tag/:tag',
                destination: '/',
            },
            {
                source: '/post/user/:user',
                destination: '/',
            },
            {
                source: '/post/timeline',
                destination: '/',
            },
        ]
    },
}

module.exports = nextConfig
