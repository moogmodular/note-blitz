import { TypographyStylesProvider } from '@mantine/core'
import { Button } from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useContext, useEffect, useRef } from 'react'
import styled from 'styled-components'

import { trpc } from '../../../utils/trpc'
import { ActionBoxAction, UXActionTypes, UXContext } from '../../context/UXContext'
import { replaceMentions } from '../common/MentionItem'

const CommentDisplayContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5em;
`

const StyledButton = styled(Button)`
    background: transparent;
    font-size: 1rem;
    border: 2px solid #000000;
    border-radius: 0;
    color: #000000;
    margin: 0 1em;
    padding: 0.25em 1em;
    max-height: 2em;
`

const CommentFooter = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
`

/* eslint-disable-next-line */
export interface CommentDisplayProps {
    commentId: string
    title: string
    depth: number
    content: { htmlContent?: string }
    author: { userName?: string }
}

const CommentDisplay = (props: CommentDisplayProps) => {
    const { state, dispatch } = useContext(UXContext)
    const contentRender = useRef(null)
    const { data: session, status } = useSession()
    const { data: commentTreeData } = trpc.useQuery(['comment:getTreeByCommentId', { commentId: props.commentId }])
    const mutationDeleteComment = trpc.useMutation(['admin:deleteCommentById'])
    const mutationSoftDeleteComment = trpc.useMutation(['admin:softDeleteCommentById'])

    useEffect(() => {
        const doc = contentRender?.current as unknown as HTMLElement
        replaceMentions(doc)
    }, [commentTreeData])

    const handleReplyComment = (data: any) => {
        dispatch({
            type: UXActionTypes.SetActionBox,
            payload: {
                actionBoxAction: ActionBoxAction.doReplyToComment,
                actionBoxData: data,
            },
        })
    }

    const handleDeleteComment = (commentId: string) => {
        mutationDeleteComment.mutate({ commentId: commentId })
    }

    const handleSoftDeleteComment = (commentId: string) => {
        mutationSoftDeleteComment.mutate({ commentId: commentId })
    }

    const createMarkup = (html: any) => ({ __html: html ? html.replace(/\n/g, '').replace(/"/g, '') : null })

    return (
        <CommentDisplayContainer>
            {props.content ? (
                <div style={{ marginLeft: `1em` }}>
                    <b>{props?.title}</b>
                    <TypographyStylesProvider style={{ fontStyle: 'Courier' }}>
                        <div
                            dangerouslySetInnerHTML={createMarkup(props?.content.htmlContent)}
                            ref={contentRender}
                        ></div>
                    </TypographyStylesProvider>
                    <CommentFooter>
                        <p>by: {props?.author?.userName}</p>
                        {session?.user?.role === 'ADMIN' ? (
                            <>
                                <StyledButton onClick={() => handleSoftDeleteComment(props.commentId)}>
                                    Soft Delete
                                </StyledButton>
                                <StyledButton onClick={() => handleDeleteComment(props.commentId)}>Delete</StyledButton>
                            </>
                        ) : null}
                        <StyledButton onClick={() => handleReplyComment(props.commentId)}>Reply</StyledButton>
                    </CommentFooter>
                    <hr />
                    {commentTreeData?.children
                        ? commentTreeData.children.map((child) => {
                              return (
                                  <CommentDisplay
                                      key={child.id}
                                      depth={props.depth + 1}
                                      author={child.author}
                                      content={child.content}
                                      commentId={child.id}
                                      title={child.title}
                                  />
                              )
                          })
                        : null}
                </div>
            ) : null}
        </CommentDisplayContainer>
    )
}

export default CommentDisplay
