import Link from 'next/link'
import { useEffect, useState } from 'react'
import { trpc } from 'utils/trpc'

export default function AboutPage() {
    const [num, setNumber] = useState<number>()
    const [balance, setBalance] = useState<number>()

    const { client } = trpc.useContext()

    useEffect(() => {
        const doInit = async () => {
            const balance = await client.query('lightning:getNodeBalance')
            setBalance(balance)
        }

        doInit()
    }, [])

    return (
        <div>
            Here&apos;s a random number from a sub: {num} <br />
            <div>The balance: {balance}</div>
            <Link href="/">
                <a>Index</a>
            </Link>
        </div>
    )
}
