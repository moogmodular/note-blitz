import { getChainBalance, getInvoices, getPeers } from 'lightning'

import { createRouter } from './context'

export const lightningRouter = createRouter().query('getNodeBalance', {
    async resolve({ ctx }) {
        console.log('NODE BALANCE')
        const lnd = ctx.lnd
        const chainBalance = await getChainBalance({ lnd })
            .then((res) => res.chain_balance)
            .catch((e) => {
                console.log(e)
            })
        console.log('getChainBalance', chainBalance)
        return chainBalance
    },
})
