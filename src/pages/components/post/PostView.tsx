import autoAnimate from '@formkit/auto-animate'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { trpc } from '../../../utils/trpc'
import FullPost from './FullPost'
import PostPreview from './PostPreview'

const PostViewContainer = styled.div`
    border: 3px solid #000;
    padding: 1rem;
    margin-bottom: 1rem;
`

export interface PreviewProps {
    id: string
    createdAt: Date
    content: string
    title: string
    excerpt: string
    commentAmount: number
    headerImage: string
    author: string
    tags: { tag: string; tagId: string }[]
}

/* eslint-disable-next-line */
export interface PostViewProps {
    postId: string
    postPreview: PreviewProps
}

const PostView = (props: PostViewProps) => {
    const [expanded, setExpanded] = useState(false)
    const mutationDeletePost = trpc.useMutation(['admin:deletePostById'])
    const mutationSoftDeletePost = trpc.useMutation(['admin:softDeletePostById'])

    const parent = useRef(null)

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    const handleExpand = () => {
        setExpanded(true)
    }

    const handleClose = () => {
        setExpanded(false)
    }

    const handleDeletePost = (postId: string) => {
        mutationDeletePost.mutate({ posyId: postId })
    }

    const handleSoftDeletePost = (postId: string) => {
        mutationSoftDeletePost.mutate({ posyId: postId })
    }

    return (
        <PostViewContainer ref={parent}>
            {expanded ? (
                <FullPost
                    postId={props.postId}
                    handleClose={handleClose}
                    handleDeletePost={handleDeletePost}
                    handleSoftDeletePost={handleSoftDeletePost}
                />
            ) : (
                <PostPreview handleExpand={handleExpand} {...props.postPreview} />
            )}
        </PostViewContainer>
    )
}

export default PostView
