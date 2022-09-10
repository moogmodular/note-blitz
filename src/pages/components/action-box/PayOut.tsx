import { useSession } from 'next-auth/react'
import React, { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { trpc } from '../../../utils/trpc'
import { BarLoader } from 'react-spinners'

const stopPollingAfter = 60 * 1000

export interface Withdrawal {}

/* eslint-disable-next-line */
export interface PayOutProps {
    inDone: () => void
}

const PayOut = (props: PayOutProps) => {
    const parent = useRef(null)
    const [withdrawal, setWithdrawal] = useState<any>(undefined)
    const [showCopied, setShowCopied] = useState(false)

    const wasWithdrawalSettled = trpc.useQuery(['lightning:wasWithdrawalSettled', { k1: withdrawal?.k1 ?? '' }], {
        refetchInterval: (data) => {
            if (!data?.withdrawalId) {
                return 1000
            }
            props.inDone()
            setWithdrawal(undefined)
            return false
        },
    })

    const getInvoiceUrl = trpc.useQuery(['lightning:getWithdrawalUrl'], {
        enabled: false,
        onSuccess: (data) => {
            console.log(data)
            setWithdrawal(data)
        },
    })

    useEffect(() => {
        getInvoiceUrl.refetch()
    }, [])

    const handleUrlStringClick = () => {
        void navigator.clipboard.writeText(withdrawal?.encoded ?? '')
        setShowCopied(true)
        setTimeout(() => {
            setShowCopied(false)
        }, 2000)
    }

    return (
        <div className="flex h-full flex-col items-center justify-around" ref={parent}>
            <QRCodeSVG value={withdrawal?.encoded ?? ''} level={'Q'} size={250} />
            <BarLoader width={250} />
            <div className="break-all text-center hover:text-indigo-400" onClick={handleUrlStringClick}>
                {withdrawal?.encoded}
            </div>
            {showCopied && <div>ln-url copied to clipboard!</div>}
        </div>
    )
}

export default PayOut
