import Link from 'next/link'
import React from 'react'
import styled from 'styled-components'

const Pill = styled.div`
    border-radius: 16px;
    padding: 0px 10px;
    display: inline-block;
    height: 20px;
    margin-right: 0.5em;
`

/* eslint-disable-next-line */
export interface TagDisplayPillProps {
    tagType: string
    withBackground?: boolean
    tagValue: string
}

const TagDisplayPill = (props: TagDisplayPillProps) => {
    // a method that returns a color based on a string
    const tagPath = props.tagType === '@' ? 'user' : 'tag'
    const getColor = (str: string) => {
        const hash = str.split('').reduce((prevHash, currVal) => {
            return (prevHash << 5) - prevHash + currVal.charCodeAt(0)
        }, 0)
        return `hsl(${hash % 360}, 80%, 50%)`
    }

    return (
        <Pill style={{ backgroundColor: props.withBackground ? getColor(props.tagValue) : 'none' }}>
            <Link href={`/post/${tagPath}/${props.tagValue}`}>{`${props.tagType}${props.tagValue}`}</Link>
        </Pill>
    )
}

export default TagDisplayPill
