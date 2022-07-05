import { getChainBalance, getPeers } from 'lightning'

import { createRouter } from './context'

export const lightningRouter = createRouter().query('getNodeBalance', {
    async resolve({ ctx }) {
        const lnd = ctx.lnd
        const chainBalance = (await getChainBalance({ lnd })).chain_balance
        return chainBalance
    },
})
