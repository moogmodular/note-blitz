import autoAnimate from '@formkit/auto-animate'
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import { signIn, useSession } from 'next-auth/react'
import { QRCodeSVG } from 'qrcode.react'
import React, { useEffect, useRef, useState } from 'react'

import { trpc } from '../../../utils/trpc'
import WalletList from '../common/WalletList'

/* eslint-disable-next-line */
export interface AuthenticateProps {}

const Authenticate = (props: AuthenticateProps) => {
    const { data: session, status } = useSession()

    const [loginUrl, setLoginUrl] = useState<{ secret: string; encoded: string }>({ secret: '', encoded: '' })
    const [showCopied, setShowCopied] = useState(false)
    const parent = useRef(null)

    const { data: dataWallets } = trpc.useQuery(['wallet:getRankedList'])

    const isSecretLoggedIn = trpc.useQuery(['auth:isSecretLoggedIn', { secret: loginUrl.secret }], {
        refetchInterval: (data) => {
            if (!session?.user) {
                if (!data?.pubkey) {
                    return 1000
                }
                setLoginUrl({ secret: '', encoded: '' })
                void signIn('credentials', { k1: data.k1, pubkey: data.pubkey, callbackUrl: '/', redirect: true })
            }
            return false
        },
    })

    const getLoginUrl = trpc.useQuery(['auth:getLoginUrl'], {
        onSuccess: (data) => {
            setLoginUrl(data)
        },
    })

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    const handleUrlStringClick = () => {
        void navigator.clipboard.writeText(loginUrl.encoded)
        setShowCopied(true)
        setTimeout(() => {
            setShowCopied(false)
        }, 2000)
    }

    return (
        <div className="flex h-full flex-col items-center justify-between" ref={parent}>
            <QRCodeSVG value={loginUrl.encoded} level={'Q'} size={250} />

            <div className="break-all text-center hover:text-indigo-400" onClick={handleUrlStringClick}>
                {loginUrl.encoded}
            </div>
            {showCopied && <div>ln-url copied to clipboard!</div>}

            <p>
                Get your cell phone out, install one of these <b>ln-url enabled wallets...</b>
            </p>
            {dataWallets ? <WalletList walletList={dataWallets.slice(0, 3)} /> : null}

            <Accordion>
                <AccordionSummary aria-controls="panel1a-content" id="panel1a-header">
                    ...other wallets
                </AccordionSummary>
                <AccordionDetails>
                    {dataWallets ? <WalletList walletList={dataWallets.slice(3)} /> : null}
                </AccordionDetails>
            </Accordion>

            <p style={{ textAlign: 'center' }}>
                ...or <b>click on the encoded ln-url text for a copy to your clipboard</b> and authenticate with anther
                ln-url method of your choice.
            </p>
        </div>
    )
}

export default Authenticate
