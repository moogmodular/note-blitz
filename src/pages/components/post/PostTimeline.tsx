import autoAnimate from '@formkit/auto-animate'
import React, { useEffect, useRef } from 'react'

import { trpc } from '../../../utils/trpc'
import PostView, { PreviewProps } from './PostView'

export const TimelineByUser = ({ user }: { user: string }) => {
    const { data: postData } = trpc.useQuery(['contentItem:getByUser', { userName: user }])
    return (
        <>
            {postData
                ? postData.map((post: PreviewProps) => (
                      <PostView key={post.id} contentItemId={post.id} postPreview={post} />
                  ))
                : null}
        </>
    )
}

export const TimelineByTag = ({ tag }: { tag: string }) => {
    const { data: postData } = trpc.useQuery(['contentItem:getByTag', { tag: tag }])
    return (
        <>
            {postData
                ? postData.map((post: PreviewProps) => (
                      <PostView key={post.id} contentItemId={post.id} postPreview={post} />
                  ))
                : null}
        </>
    )
}

export const TimelineByAll = () => {
    const { data: postData } = trpc.useQuery(['contentItem:getOpList'])
    return (
        <>
            {postData
                ? postData.map((post: PreviewProps) => (
                      <PostView key={post.id} contentItemId={post.id} postPreview={post} />
                  ))
                : null}
        </>
    )
}

/* eslint-disable-next-line */
export interface PostTimelineProps {
    user?: string
    tag?: string
}

const PostTimeline = (props: PostTimelineProps) => {
    const parent = useRef(null)

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    const viewParam = (props: any): string => {
        if (props.user) {
            return 'user'
        } else if (props.tag) {
            return 'tag'
        }
        return 'all'
    }

    return (
        <div className="no-scrollbar overflow-x-auto pt-1" ref={parent}>
            {
                {
                    user: <TimelineByUser user={props.user!} />,
                    tag: <TimelineByTag tag={props.tag!} />,
                    all: <TimelineByAll />,
                }[viewParam(props)]
            }
        </div>
    )
}

export default PostTimeline
