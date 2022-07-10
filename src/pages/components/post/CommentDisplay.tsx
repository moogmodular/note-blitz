import { TypographyStylesProvider } from '@mantine/core'
import { Button } from '@mui/material'
import { ContentItem } from '@prisma/client'
import { useSession } from 'next-auth/react'
import React, { useContext, useRef } from 'react'
import styled from 'styled-components'

import { trpc } from '../../../utils/trpc'
import { ActionBoxAction, UXActionTypes, UXContext } from '../../context/UXContext'

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
    contentItemId: string
    title: string
    depth: number
    content: { htmlContent?: string }
    author: { userName?: string }
}

const CommentDisplay = (props: CommentDisplayProps) => {
    const { state, dispatch } = useContext(UXContext)
    const contentRender = useRef(null)
    const { data: session, status } = useSession()
    const { data: commentTreeData } = trpc.useQuery(['contentItem:getTreeById', { contentItemId: props.contentItemId }])
    const mutationDeleteComment = trpc.useMutation(['admin:deletePostById'])
    const mutationSoftDeleteComment = trpc.useMutation(['admin:softDeletePostById'])

    const handleReplyComment = (data: any) => {
        dispatch({
            type: UXActionTypes.SetActionBox,
            payload: {
                actionBoxAction: ActionBoxAction.doReplyToComment,
                actionBoxData: data,
            },
        })
    }

    const handleDeleteComment = (contentItemId: string) => {
        mutationDeleteComment.mutate({ contentItemId: contentItemId })
    }

    const handleSoftDeleteComment = (contentItemId: string) => {
        mutationSoftDeleteComment.mutate({ contentItemId: contentItemId })
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
                                <StyledButton onClick={() => handleSoftDeleteComment(props.contentItemId)}>
                                    Soft Delete
                                </StyledButton>
                                <StyledButton onClick={() => handleDeleteComment(props.contentItemId)}>
                                    Delete
                                </StyledButton>
                            </>
                        ) : null}
                        <StyledButton onClick={() => handleReplyComment(props.contentItemId)}>Reply</StyledButton>
                    </CommentFooter>
                    <hr />
                    {commentTreeData?.children
                        ? commentTreeData.children.map((child: ContentItem & { author: Record<string, any> }) => {
                              const content = child.content as { htmlContent: string }
                              return (
                                  <CommentDisplay
                                      key={child.id}
                                      depth={props.depth + 1}
                                      author={child.author}
                                      content={content}
                                      contentItemId={child.id}
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
