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

    const wasInvoicePaid = trpc.useQuery(
        ['lightning:isInvoicePaid', { lndId: invoice?.lndId ?? '', hash: invoice?.hash ?? '' }],
        {
            refetchInterval: (data) => {
                console.log('isInvoicePaid', data)
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
            console.log(data)
            setInvoice(data)
        },
    })

    useEffect(() => {
        console.log(props)
        getInvoiceUrl.refetch()
    }, [])

    return (
        <div className="flex h-full flex-col items-center justify-around" ref={parent}>
            <QRCodeSVG value={invoice?.bolt11 ?? ''} level={'Q'} size={250} />
            <div>pending invoice for: {(invoice?.mSatsRequested ?? 0) / 1000}</div>
            <BarLoader width={250} />
        </div>
    )
}

export default PayIn