import { getChainBalance, getPeers, getWalletInfo } from 'lightning'

import { createRouter } from './context'

export const lightningRouter = createRouter().mutation('nodeBalance', {
    async resolve({ ctx }) {
        const lnd = ctx.lnd
        const chainBalance = await getChainBalance({ lnd })
            .then((res) => res.chain_balance)
            .catch((e) => {
                console.log(e)
            })
        const info = await getWalletInfo({ lnd }).then((res) => res.public_key)
        const peers = await getPeers({ lnd }).then((res) => res.peers)
        console.log('getChainBalance', chainBalance)
        console.log('info', info)
        console.log('peers', peers)
        return chainBalance
    },
})
