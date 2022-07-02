import { useRouter } from 'next/router'
import React from 'react'
import styled from 'styled-components'

import { trpc } from '../../utils/trpc'
import FullPost from './post/FullPost'

const IsolatedPostPropsContainer = styled.div`
    border: 3px solid #000;
    padding: 1rem;
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

/* eslint-disable-next-line */
export interface IsolatedPostProps {
    slug: string
}

const IsolatedPost = (props: IsolatedPostProps) => {
    const router = useRouter()
    const { data: postData } = trpc.useQuery(['post:getPostBySlug', { slug: props.slug }])
    const mutationDeletePost = trpc.useMutation(['admin:deletePostById'])
    const mutationSoftDeletePost = trpc.useMutation(['admin:softDeletePostById'])

    const handleDeletePost = (postId: string) => {
        mutationDeletePost.mutate({ posyId: postId })
    }

    const handleSoftDeletePost = (postId: string) => {
        mutationSoftDeletePost.mutate({ posyId: postId })
    }

    const handleClose = () => {
        router.push('/')
    }

    return (
        <IsolatedPostPropsContainer>
            {postData ? (
                <FullPost
                    postId={postData.id}
                    handleClose={handleClose}
                    handleDeletePost={handleDeletePost}
                    handleSoftDeletePost={handleSoftDeletePost}
                />
            ) : null}
        </IsolatedPostPropsContainer>
    )
}

export default IsolatedPost
