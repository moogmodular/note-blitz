import autoAnimate from '@formkit/auto-animate'
import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

import { trpc } from '../../../utils/trpc'
import PostView, { PreviewProps } from './PostView'

const PostPreviewContainer = styled.div`
    overflow: scroll;
    overflow-x: hidden;

    &::-webkit-scrollbar {
        width: 0; /* Remove scrollbar space */
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: #ff0000;
    }
`

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
export interface PostTimelineWhatProps extends PostTimelineProps {}

export const PostTimelineWhat = (props: PostTimelineWhatProps) => {
    if (props.user) {
        return <TimelineByUser user={props.user} />
    } else if (props.tag) {
        return <TimelineByTag tag={props.tag} />
    } else {
        return <TimelineByAll />
    }
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

    return (
        <PostPreviewContainer ref={parent}>
            <PostTimelineWhat {...props} />
        </PostPreviewContainer>
    )
}

export default PostTimeline
