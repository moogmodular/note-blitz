import { TypographyStylesProvider } from '@mantine/core'
import { ContentItem } from '@prisma/client'
import { useSession } from 'next-auth/react'
import React, { useContext, useRef } from 'react'
import { trpc } from '../../../utils/trpc'
import { ActionBoxAction, UXActionTypes, UXContext } from '../../context/UXContext'
import BorderedButton from '../BorderedButton'

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
        <div className="mt-4 flex flex-col border-2 border-gray-400 p-4">
            {props.content ? (
                <div className="ml-1">
                    <b>{props?.title}</b>
                    <TypographyStylesProvider style={{ fontStyle: 'Courier' }}>
                        <div
                            dangerouslySetInnerHTML={createMarkup(props?.content.htmlContent)}
                            ref={contentRender}
                        ></div>
                    </TypographyStylesProvider>
                    <div className="flex flex-row-reverse">
                        {session?.user?.role === 'ADMIN' ? (
                            <>
                                <BorderedButton
                                    buttonText={'Soft Delete'}
                                    action={() => handleSoftDeleteComment(props.contentItemId)}
                                />
                                <BorderedButton
                                    buttonText={'Delete'}
                                    action={() => handleDeleteComment(props.contentItemId)}
                                />
                            </>
                        ) : null}
                        <BorderedButton buttonText={'Reply'} action={() => handleReplyComment(props.contentItemId)} />
                        <p>by: {props?.author?.userName}</p>
                    </div>
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
        </div>
    )
}

export default CommentDisplay
