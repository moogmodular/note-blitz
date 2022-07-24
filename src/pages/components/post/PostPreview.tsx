import { Divider } from '@mui/material'
import { format } from 'date-fns'
import React from 'react'

import TagDisplayPill from '../common/TagDisplayPill'

/* eslint-disable-next-line */
export interface PostPreviewProps {
    id: string
    createdAt: Date
    content: string
    headerImage: string
    title: string
    excerpt: string
    replyCount: number
    author: string
    earned?: string
    tags: { tag: string; tagId: string }[]
    handleExpand: () => void
}

const PostPreview = (props: PostPreviewProps) => {
    return (
        <div className="flex flex-col gap-6 2xl:flex-row">
            <img
                className="h-px-250 w-px-250"
                onClick={() => props.handleExpand()}
                src={props.headerImage}
                alt="header image"
            />
            <div className="flex w-full flex-col justify-between">
                <div className="text-xl font-bold" onClick={() => props.handleExpand()}>
                    {props.title}
                </div>
                <div>{props.excerpt}</div>

                <div className="flex flex-row">
                    {props.tags?.map((tag) => {
                        return (
                            <div key={tag.tagId} className="mr-2">
                                <TagDisplayPill tagValue={tag.tag} tagType={'#'} withBackground={true} />
                            </div>
                        )
                    })}
                </div>
                <div className="flex flex-row justify-between">
                    by: <TagDisplayPill tagValue={props.author} tagType={'@'} />
                    <Divider light orientation={'vertical'} />
                    created: {format(props.createdAt ?? new Date(), 'dd.MM.yyyy')}
                    <Divider light orientation={'vertical'} />
                    {props.earned} sats earned
                    <Divider light orientation={'vertical'} />
                    {props.replyCount} comments
                </div>
            </div>
        </div>
    )
}

export default PostPreview
