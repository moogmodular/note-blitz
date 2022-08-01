import { TypographyStylesProvider } from '@mantine/core'
import { ContentItem } from '@prisma/client'
import { useSession } from 'next-auth/react'
import React, { useContext, useRef } from 'react'
import { trpc } from '../../../utils/trpc'
import { ActionBoxAction, UXActionTypes, UXContext } from '../../context/UXContext'
import BorderedButton from '../BorderedButton'
import { BarLoader } from 'react-spinners'
import { format } from 'date-fns'

/* eslint-disable-next-line */
export interface CommentDisplayProps {
    contentItemId: string
    title: string
    depth: number
    createdAt: Date
    content: { htmlContent?: string }
    author: { userName?: string }
}

const CommentDisplay = (props: CommentDisplayProps) => {
    const { state, dispatch } = useContext(UXContext)
    const contentRender = useRef(null)
    const { data: session, status } = useSession()
    const { data: commentTreeData, isLoading } = trpc.useQuery([
        'contentItem:getTreeById',
        { contentItemId: props.contentItemId },
    ])
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
        <div
            className={`mt-4 flex flex-col border-t-2 border-l-2 border-gray-200 pl-4 pt-4 ${
                props.depth === 0 ? '' : ''
            }`}
        >
            {props.content ? (
                <div className="ml-1">
                    <b>{props?.title}</b>
                    <TypographyStylesProvider style={{ fontStyle: 'Courier' }}>
                        <div
                            dangerouslySetInnerHTML={createMarkup(props?.content.htmlContent)}
                            ref={contentRender}
                        ></div>
                    </TypographyStylesProvider>
                    <div className="flex flex-row">
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
                        <p className="text-sm">by: {props?.author?.userName}</p>
                        <hr />
                        <p className="text-sm">
                            crated: {format(new Date(props?.createdAt as unknown as string), 'dd.MM.yyyy hh:mm')}
                        </p>
                        <div className="ml-auto">
                            <BorderedButton
                                buttonText={'Reply'}
                                action={() => handleReplyComment(props.contentItemId)}
                            />
                        </div>
                    </div>
                    {commentTreeData?.children ? (
                        commentTreeData.children.map((child: ContentItem & { author: Record<string, any> }) => {
                            const content = child.content as { htmlContent: string }
                            return (
                                <CommentDisplay
                                    key={child.id}
                                    depth={props.depth + 1}
                                    author={child.author}
                                    createdAt={child.createdAt}
                                    content={content}
                                    contentItemId={child.id}
                                    title={child.title}
                                />
                            )
                        })
                    ) : (
                        <BarLoader width={250} />
                    )}
                </div>
            ) : null}
        </div>
    )
}

export default CommentDisplay
