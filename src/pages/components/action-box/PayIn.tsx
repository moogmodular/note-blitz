import React, { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { trpc } from '../../../utils/trpc'
import { BarLoader } from 'react-spinners'

export interface Invoice {
    id: string
    lndId: string
    createdAt: Date
    updatedAt: Date
    hash: string
    bolt11: string
    expiresAt: Date
    confirmedAt: Date | null
    mSatsRequested: number
    mSatsReceived: number | null
    cancelled: boolean
    userId: string | null
}

/* eslint-disable-next-line */
export interface PayInProps {
    amount: number
    inDone: () => void
}

const PayIn = (props: PayInProps) => {
    const parent = useRef(null)
    const [invoice, setInvoice] = useState<Invoice | undefined>(undefined)
    const [showCopied, setShowCopied] = useState(false)

    const wasInvoicePaid = trpc.useQuery(
        ['lightning:isInvoicePaid', { lndId: invoice?.lndId ?? '', hash: invoice?.hash ?? '' }],
        {
            refetchInterval: (data) => {
                if (!data?.hash) {
                    return 1000
                }
                props.inDone()
                setInvoice(undefined)
                return false
            },
        },
    )

    const getInvoiceUrl = trpc.useQuery(['lightning:createInvoice', { amount: props.amount }], {
        enabled: false,
        onSuccess: (data) => {
            setInvoice(data)
        },
    })

    useEffect(() => {
        getInvoiceUrl.refetch()
    }, [])

    const handleUrlStringClick = () => {
        void navigator.clipboard.writeText(invoice?.bolt11 ?? '')
        setShowCopied(true)
        setTimeout(() => {
            setShowCopied(false)
        }, 2000)
    }

    return (
        <div className="flex h-full flex-col items-center justify-around" ref={parent}>
            <QRCodeSVG value={invoice?.bolt11 ?? ''} level={'Q'} size={250} />
            <div>pending invoice for: {(invoice?.mSatsRequested ?? 0) / 1000}</div>
            <BarLoader width={250} />
            <div className="break-all text-center hover:text-indigo-400" onClick={handleUrlStringClick}>
                {invoice?.bolt11}
            </div>
            {showCopied && <div>ln-url copied to clipboard!</div>}
        </div>
    )
}

export default PayIn
