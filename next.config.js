/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
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
