import * as fs from 'fs'

import { addPeer, createChainAddress, openChannel } from 'lightning'

import { spawnCluster } from './spawn-cluster'

const asyncRetry = require('async/retry')

const size = 2
const channelCapacityTokens = 1e6
const count = 1500
const defaultFee = 1e3
const defaultVout = 0
const giftTokens = 9999
const interval = 250
const times = 1000
const txIdHexLength = 32 * 2

process.stdin.resume()

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
async function main() {
    console.log('hello')

    const cluster: any = await spawnCluster({ size }, null)
    const [{ generate, lnd, lightningDocker }, target] = cluster.nodes

    console.log('the cluster: ', cluster)
    cluster.nodes.map((node: any) => {
        console.log(node.lightningDocker)
    })

    const { address } = await createChainAddress({ lnd })

    await generate({ count })

    const channelOpen = await asyncRetry({ interval, times }, async () => {
        await addPeer({ lnd, public_key: target.id, socket: target.socket })

        return await openChannel({
            lnd,
            chain_fee_tokens_per_vbyte: defaultFee,
            cooperative_close_address: address,
            give_tokens: giftTokens,
            local_tokens: channelCapacityTokens,
            partner_public_key: target.id,
            partner_socket: target.socket,
        })
    })

    console.log('CHANNEL: ', channelOpen)

    const content = `# COPY TO ENV
LND_CERT=${cluster.nodes[0].lightningDocker.cert}
LND_MACAROON=${cluster.nodes[0].lightningDocker.macaroon}
LND_HOST=${cluster.nodes[0].lightningDocker.socket.split(':')[0]}
LND_PORT=${cluster.nodes[0].lightningDocker.socket.split(':')[1]}
`

    fs.writeFile(__dirname + '/../copy-to.env', content, (err) => {
        if (err) {
            console.error(err)
        } else {
            console.log('file was written')
        }
    })

    // await cluster.kill({})
}

void main()
