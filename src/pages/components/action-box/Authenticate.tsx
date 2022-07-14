import autoAnimate from '@formkit/auto-animate'
import {Accordion, AccordionDetails, AccordionSummary} from '@mui/material'
import {ExpandMore} from '@styled-icons/material-rounded/ExpandMore'
import {signIn, useSession} from 'next-auth/react'
import {QRCodeSVG} from 'qrcode.react'
import React, {useEffect, useRef, useState} from 'react'
import styled from 'styled-components'

import {trpc} from '../../../utils/trpc'
import WalletList from '../common/WalletList'

const AuthenticateContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 3em;
`

const LnUrlsString = styled.div`
    padding-left: 1em;
    padding-right: 1em;
    width: 90%;
    word-wrap: break-word;
    text-align: center;
    &:hover {
        color: blueviolet;
    }
`

const CopiedText = styled.div`
    color: red; ;
`

export const ExpandMoreIcon = styled(ExpandMore)``

const WalletAction = styled.div`
    margin-top: 2em;
    display: flex;
    flex-direction: column;
    gap: 1em;
    align-items: center;
    justify-content: center;
`

const QrWrapper = styled.div`
    display: flex;
    justify-content: center;
`

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
        <AuthenticateContainer ref={parent}>
            <QrWrapper>
                <QRCodeSVG value={loginUrl.encoded} level={'Q'} size={250} />
            </QrWrapper>
            <LnUrlsString onClick={handleUrlStringClick}>{loginUrl.encoded}</LnUrlsString>
            {showCopied && <CopiedText>ln-url copied to clipboard!</CopiedText>}

            <WalletAction>
                <p>
                    Get your cell phone out, install one of these <b>ln-url enabled wallets...</b>
                </p>
                {dataWallets ? <WalletList walletList={dataWallets.slice(0, 3)} /> : null}

                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        ...other wallets
                    </AccordionSummary>
                    <AccordionDetails>
                        {dataWallets ? <WalletList walletList={dataWallets.slice(3)} /> : null}
                    </AccordionDetails>
                </Accordion>

                <p style={{ textAlign: 'center' }}>
                    ...or <b>click on the encoded ln-url text for a copy to your clipboard</b> and authenticate with
                    anther ln-url method of your choice.
                </p>
            </WalletAction>
        </AuthenticateContainer>
    )
}

export default Authenticate
