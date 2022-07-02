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

/* eslint-disable-next-line */
export interface WalletListProps {}

const WalletList = (props: WalletListProps) => {
    const walletList = [
        { image: 'https://picsum.photos/200/200', url: 'https://breez.technology', name: 'Breez' },
        { image: 'https://picsum.photos/200/200', url: 'https://breez.technology', name: 'Muun' },
        { image: 'https://picsum.photos/200/200', url: 'https://breez.technology', name: 'Blue Wallet' },
    ]

    return (
        <WalletListContainer>
            {walletList.map((wlt) => {
                return (
                    <WalletListColumn key={wlt.name} target="_blank" href={wlt.url}>
                        <img src={wlt.image} alt={wlt.name} width={'50px'} height={'50px'} />
                        <p>{wlt.name}</p>
                    </WalletListColumn>
                )
            })}
        </WalletListContainer>
    )
}

export default WalletList
