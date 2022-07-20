import React from 'react'

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
    // TODO: fix this
    walletList: any[]
}

const WalletList = (props: WalletListProps) => {
    return (
        <div className="flex flex-row">
            {props.walletList
                ? props.walletList.map((wlt) => {
                      return (
                          <a
                              className="flex flex-col items-center"
                              key={wlt.id}
                              target="_blank"
                              href={wlt.url}
                              rel="noreferrer"
                          >
                              <img src={wlt.icon} alt={wlt.displayName} width={'50px'} height={'50px'} />
                              <p className="break-words">{wlt.displayName}</p>
                          </a>
                      )
                  })
                : null}
        </div>
    )
}

export default WalletList
