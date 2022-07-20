import React from 'react'

/* eslint-disable-next-line */
export interface PublicKeyDisplayPillProps {
    publicKey?: string
}

const PublicKeyDisplayPill = (props: PublicKeyDisplayPillProps) => {
    const displayKey = props.publicKey?.substring(0, 8) + '...'

    // a method that returns a color based on a string
    const getColor = (str: string) => {
        const hash = str.split('').reduce((prevHash, currVal) => {
            return (prevHash << 5) - prevHash + currVal.charCodeAt(0)
        }, 0)
        return `hsl(${hash % 360}, 80%, 50%)`
    }

    return (
        <div className="rounded-lg px-3" style={{ backgroundColor: getColor(props.publicKey ?? '') }}>
            {displayKey}
        </div>
    )
}

export default PublicKeyDisplayPill
