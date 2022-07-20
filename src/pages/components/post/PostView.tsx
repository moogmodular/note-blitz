import autoAnimate from '@formkit/auto-animate'
import React, { useEffect, useRef, useState } from 'react'

import { trpc } from '../../../utils/trpc'
import FullPost from './FullPost'
import PostPreview from './PostPreview'

export interface PreviewProps {
    id: string
    createdAt: Date
    content: string
    title: string
    excerpt: string
    replyCount: number
    headerImage: string
    author: string
    tags: { tag: string; tagId: string }[]
}

/* eslint-disable-next-line */
export interface PostViewProps {
    contentItemId: string
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

    const handleDeletePost = (contentItemId: string) => {
        mutationDeletePost.mutate({ contentItemId: contentItemId })
    }

    const handleSoftDeletePost = (contentItemId: string) => {
        mutationSoftDeletePost.mutate({ contentItemId: contentItemId })
    }

    return (
        <div className="bottom-1 mb-6 border-2 border-black p-4" ref={parent}>
            {expanded ? (
                <FullPost
                    contentItemId={props.contentItemId}
                    handleClose={handleClose}
                    handleDeletePost={handleDeletePost}
                    handleSoftDeletePost={handleSoftDeletePost}
                />
            ) : (
                <PostPreview handleExpand={handleExpand} {...props.postPreview} />
            )}
        </div>
    )
}

export default PostView
