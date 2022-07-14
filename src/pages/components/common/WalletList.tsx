import React from 'react'
import styled from 'styled-components'

const WalletListContainer = styled.div`
    display: flex;
    gap: 1em;
    justify-content: space-between;
    width: 50%;
`

const WalletListColumn = styled.a`
    display: flex;
    flex-direction: column;
    align-items: center;
`

export interface Wallet {
    id: number
    displayName: string
    description?: string
    url: string
    icon: string
    rank: number
}

/* eslint-disable-next-line */
export interface WalletListProps {
    walletList: Wallet[]
}

const WalletList = (props: WalletListProps) => {
    return (
        <WalletListContainer>
            {props.walletList.map((wlt) => {
                return (
                    <WalletListColumn key={wlt.id} target="_blank" href={wlt.url}>
                        <img src={wlt.icon} alt={wlt.displayName} width={'50px'} height={'50px'} />
                        <p>{wlt.displayName}</p>
                    </WalletListColumn>
                )
            })}
        </WalletListContainer>
    )
}

export default WalletList
