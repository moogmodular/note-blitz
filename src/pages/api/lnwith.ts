import { prisma } from '../../server/db/client'
import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const query = req.query as { sig: string; k1: string; key: string; pr: string }

    if (!query.k1) {
        return res.status(400).json({ status: 'ERROR', reason: 'k1 not provided' })
    }

    if (query.pr) {
        return doWithdrawal(query, res)
    }

    let reason
    try {
        const lnWithdrawal = await prisma.lnWithdrawal.findFirst({
            where: {
                k1: query.k1,
                createdAt: {
                    gt: new Date(new Date().setHours(new Date().getHours() - 1)),
                },
            },
        })
        if (lnWithdrawal) {
            const user = await prisma.user.findUnique({
                where: { id: lnWithdrawal.userId! },
                include: { invoices: true, withdrawalsFinal: true },
            })
            if (user) {
                const paidIn = user?.invoices
                    .filter((invoice) => invoice.confirmedAt)
                    .reduce((acc, cur) => acc + (cur?.mSatsReceived ?? 0), 0)
                const paidOut = user?.withdrawalsFinal
                    .filter((withdrawal) => withdrawal.status === 'CONFIRMED')
                    .reduce((acc, cur) => acc + (cur?.mSatsPaid ?? 0), 0)
                const maxAmount = (paidIn ? paidIn - (paidOut ?? 0) : 0) / 1000
                return res.status(200).json({
                    tag: 'withdrawRequest', // type of LNURL
                    callback: `https://${process.env.DOMAIN}:3000/api/lnwith`,
                    k1: query.k1,
                    defaultDescription: `Withdrawal for @${user.userName} on noteblitz.app for maximum ${
                        maxAmount - 1
                    }`, // A default withdrawal invoice description
                    minWithdrawable: 10,
                    maxWithdrawable: maxAmount * 1000 - 1000,
                })
            } else {
                reason = 'user not found'
            }
        } else {
            reason = 'withdrawal not found'
        }
    } catch (error) {
        console.log(error)
        reason = 'internal server error'
    }

    console.log(reason)

    return res.status(400).json({ status: 'ERROR', reason })
}

async function doWithdrawal(query: { sig: string; k1: string; key: string; pr: string }, res: NextApiResponse) {
    const lnWithdrawal = await prisma.lnWithdrawal.findUnique({ where: { k1: query.k1 } })
    if (!lnWithdrawal) {
        return res.status(400).json({ status: 'ERROR', reason: 'invalid k1' })
    }
    const me = await prisma.user.findUnique({ where: { id: lnWithdrawal.userId ?? '' } }) // TODO: fix this
    if (!me) {
        return res.status(400).json({ status: 'ERROR', reason: 'user not found' })
    }

    const withdrawalData = await fetch(`https://${process.env.DOMAIN}:3000/api/create-withdrawal`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({ invoice: query.pr, maxFee: 10, me: me.id, k1: query.k1 }),
    })
        .then((res) => res.json())
        .catch((err) => console.log(err))

    const updatedLnWithdrawal = await prisma.lnWithdrawal
        .update({
            where: { k1: query.k1 },
            data: { withdrawalId: withdrawalData?.data.id },
        })
        .catch((err) => console.log(err))

    return res.status(200).json({ status: 'OK' })
}
