import autoAnimate from '@formkit/auto-animate'
import { TypographyStylesProvider } from '@mantine/core'
import { Divider } from '@mui/material'
import { ContentItem } from '@prisma/client'
import { format } from 'date-fns'
import parse, { DOMNode, HTMLReactParserOptions } from 'html-react-parser'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import React, { useContext, useEffect, useRef } from 'react'

import { trpc } from '../../../utils/trpc'
import { ActionBoxAction, UXActionTypes, UXContext } from '../../context/UXContext'
import TagDisplayPill from '../common/TagDisplayPill'
import CommentDisplay from './CommentDisplay'
import BorderedButton from '../BorderedButton'

/* eslint-disable-next-line */
export interface FullPostProps {
    contentItemId: string
    handleClose: () => void
    handleDeletePost: (id: string) => void
    handleSoftDeletePost: (id: string) => void
}

const FullPost = (props: FullPostProps) => {
    const { dispatch } = useContext(UXContext)
    const { data: session } = useSession()

    const parent = useRef(null)

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    const { data: postData } = trpc.useQuery(['contentItem:getById', { contentItemId: props.contentItemId }])
    const { data: commentData } = trpc.useQuery(['contentItem:getTreeById', { contentItemId: props.contentItemId }])

    const handleEditPost = (data: any) => {
        dispatch({
            type: UXActionTypes.SetActionBox,
            payload: {
                actionBoxAction: ActionBoxAction.doEditPost,
                actionBoxData: data,
            },
        })
    }

    const handleReplyPost = (data: any) => {
        dispatch({
            type: UXActionTypes.SetActionBox,
            payload: {
                actionBoxAction: ActionBoxAction.doReplyToPost,
                actionBoxData: data,
            },
        })
    }

    // const handleTip = (data: any) => {
    //     dispatch({
    //         type: UXActionTypes.SetActionBox,
    //         payload: {
    //             actionBoxAction: ActionBoxAction.tipArticle,
    //             actionBoxData: data,
    //         },
    //     })
    // }

    const parser = (input: string) => {
        const options: HTMLReactParserOptions = {
            replace: (domNode) => {
                const node = domNode as DOMNode & { attribs: Record<string, any>; name: string }
                if (node.type === 'tag' && node.name === 'span' && node.attribs.class === 'mention') {
                    const tagType = node.attribs['data-denotation-char']
                    const tagValue = node.attribs['data-value']
                    return <TagDisplayPill tagType={tagType} tagValue={tagValue} />
                }
            },
        }

        if (input) {
            return parse(input, options)
        }
    }

    return (
        <div>
            {postData ? (
                <>
                    <div className="flex flex-row gap-6">
                        <img
                            onClick={() => props.handleClose()}
                            className="h-px-250 w-px-250"
                            src={postData.headerImage ?? ''}
                            alt="header image"
                        />

                        <div className="flex w-full flex-col justify-between">
                            <div className="text-xl font-bold">
                                <div onClick={() => props.handleClose()}>{postData.title}</div>
                                <Link href={`/post/single/${postData.slug}`}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                    </svg>
                                </Link>
                            </div>
                            <div>{postData.excerpt}</div>
                            <div className="flex flex-row">
                                {postData.tags?.map((tag) => {
                                    return (
                                        <div key={tag.tagId} className="mr-2">
                                            <TagDisplayPill
                                                tagValue={tag.tag.name}
                                                tagType={'#'}
                                                withBackground={true}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="flex flex-row justify-between">
                                by: <TagDisplayPill tagValue={postData?.author?.userName ?? ''} tagType={'@'} />
                                <Divider light orientation={'vertical'} />
                                created: {format(postData.createdAt ?? new Date(), 'dd.MM.yyyy')}
                                <Divider light orientation={'vertical'} />
                                {postData.earned} sats earned
                                <div className="flex flex-row-reverse">
                                    {session && session.user.role === 'ADMIN' ? (
                                        <>
                                            <BorderedButton
                                                buttonText={'SDelete'}
                                                action={() => props.handleSoftDeletePost(props.contentItemId)}
                                            />
                                            <BorderedButton
                                                buttonText={'Delete'}
                                                action={() => props.handleDeletePost(props.contentItemId)}
                                            />
                                        </>
                                    ) : null}
                                    <BorderedButton buttonText={'Close'} action={() => props.handleClose()} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8">
                        <TypographyStylesProvider style={{ fontStyle: 'Courier' }}>
                            {parser(postData.content.htmlContent as string)}
                        </TypographyStylesProvider>
                    </div>
                    <div className="flex flex-row-reverse">
                        {session?.user.userName === postData?.author?.userName ? (
                            <BorderedButton buttonText={'Edit'} action={() => handleEditPost(postData.id)} />
                        ) : null}
                        {/*<StyledButton onClick={() => handleTip(postData.id)}>*/}
                        {/*    <SmallFlash /> Tip*/}
                        {/*</StyledButton>*/}
                        <BorderedButton buttonText={'Reply'} action={() => handleReplyPost(postData.id)} />
                    </div>
                    <div ref={parent}>
                        {commentData &&
                            commentData.children.map((comment: ContentItem & { author: Record<string, any> }) => {
                                const author = comment.author as { userName?: string | undefined }
                                const content = comment.content as { htmlContent?: string | undefined }
                                return (
                                    <CommentDisplay
                                        key={comment.id}
                                        depth={0}
                                        author={author}
                                        content={content}
                                        contentItemId={comment.id}
                                        title={comment.title}
                                    />
                                )
                            })}
                    </div>
                </>
            ) : null}
        </div>
    )
}

export default FullPost
