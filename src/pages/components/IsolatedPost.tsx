import { useRouter } from 'next/router'
import React from 'react'

import { trpc } from '../../utils/trpc'
import FullPost from './post/FullPost'

/* eslint-disable-next-line */
export interface IsolatedPostProps {
    slug: string
}

const IsolatedPost = (props: IsolatedPostProps) => {
    const router = useRouter()
    const { data: postData } = trpc.useQuery(['contentItem:getBySlug', { slug: props.slug }])
    const mutationDeletePost = trpc.useMutation(['admin:deletePostById'])
    const mutationSoftDeletePost = trpc.useMutation(['admin:softDeletePostById'])

    const handleDeletePost = (contentItemId: string) => {
        mutationDeletePost.mutate({ contentItemId: contentItemId })
    }

    const handleSoftDeletePost = (contentItemId: string) => {
        mutationSoftDeletePost.mutate({ contentItemId: contentItemId })
    }

    const handleClose = async () => {
        await router.push('/')
    }

    return (
        <div className="no-scrollbar overflow-x-auto border-2 border-black p-4">
            {postData ? (
                <FullPost
                    contentItemId={postData?.id!}
                    handleClose={handleClose}
                    handleDeletePost={handleDeletePost}
                    handleSoftDeletePost={handleSoftDeletePost}
                />
            ) : null}
        </div>
    )
}

export default IsolatedPost
