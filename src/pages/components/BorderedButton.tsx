import React from 'react'

/* eslint-disable-next-line */

export interface BorderedButtonProps {
    buttonText: string
    action: () => void
}

const BorderedButton = (props: BorderedButtonProps) => {
    return (
        <button onClick={props.action} className="h-9 w-32 border-2 border-black">
            {props.buttonText}
        </button>
    )
}

export default BorderedButton
