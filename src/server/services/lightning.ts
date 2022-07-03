export const lnUrlService = require('lnurl').createServer({
    host: process.env.SERVER_HOST,
    port: process.env.LNURL_SERVER_PORT,
    listen: true,
    url: `http://${process.env.SERVER_HOST}:${process.env.LNURL_SERVER_PORT}`,
    lightning: {
        backend: 'lnd',
        config: {
            hostname: `${process.env.LNURL_SERVER_HOST}:${process.env.LNURL_SERVER_PORT}`,
            cert: { data: process.env.LND_CERT },
            macaroon: { data: process.env.LND_MACAROON },
            protocol: 'https',
        },
    },
    store: {
        backend: 'memory',
    },
    // store: {
    //     backend: 'knex',
    //     config: {
    //         client: 'postgres',
    //         connection: {
    //             host: process.env.DB_HOST,
    //             port: process.env.DB_PORT,
    //             user: process.env.DB_USER,
    //             password: process.env.DB_PASSWORD,
    //             database: process.env.DB_NAME,
    //         },
    //     },
    // },
})
