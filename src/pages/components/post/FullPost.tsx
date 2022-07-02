import autoAnimate from '@formkit/auto-animate'
import { TypographyStylesProvider } from '@mantine/core'
import { Button } from '@mui/material'
import { Outbound } from '@styled-icons/material-outlined/Outbound'
import { format } from 'date-fns'
import parse, { DOMNode, HTMLReactParserOptions } from 'html-react-parser'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import React, { useContext, useEffect, useRef } from 'react'
import styled from 'styled-components'

import { trpc } from '../../../utils/trpc'
import { ActionBoxAction, UXActionTypes, UXContext } from '../../context/UXContext'
import TagDisplayPill from '../common/TagDisplayPill'
import CommentDisplay from './CommentDisplay'

const PostBox = styled.div`
    display: flex;
`

const PostBoxContent = styled.div`
    padding-left: 1em;
    width: 100%;
`

const FullPostHeader = styled.div`
    display: flex;
    flex-direction: row;
    margin-bottom: 2em;
    justify-content: space-between;
`

const FullPostHeaderTextContent = styled.div`
    flex: 1;
    display: flex;
    margin-left: 1em;
    flex-direction: column;
    justify-content: space-between;
`

const StyledButton = styled(Button)`
    background: transparent;
    font-size: 1rem;
    border: 2px solid #000000;
    border-radius: 0;
    color: #000000;
    margin: 0 0.5em;
    padding: 0.25em 1em;
    max-height: 2em;
`

const PostingFooter = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`

const ButtonRow = styled.div`
    display: flex;
    flex-direction: row;
`

const PostingFooterLeft = styled.div`
    display: flex;
    flex-direction: column;
`

const PillListInFooter = styled.div`
    display: flex;
    margin-bottom: 0.5em;
`

const PostHeaderFooter = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`

const HeaderTitleContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: baseline;
`

export const SmallOutbound = styled(Outbound)`
    width: 25px;
    height: 25px;
`

const ButtonOutContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
`

/* eslint-disable-next-line */
export interface FullPostProps {
    postId: string
    handleClose: () => void
    handleDeletePost: (id: string) => void
    handleSoftDeletePost: (id: string) => void
}

const FullPost = (props: FullPostProps) => {
    const { state, dispatch } = useContext(UXContext)
    const { data: session, status } = useSession()

    const parent = useRef(null)

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    const { data: postData } = trpc.useQuery(['post:getPostById', { postId: props.postId }])
    const { data: commentData } = trpc.useQuery(['comment:getForPostById', { postId: props.postId }])

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
        <PostBox>
            <PostBoxContent>
                <FullPostHeader>
                    <img src={postData?.headerImage} alt="header image" width={'250px'} height={'250px'} />
                    <FullPostHeaderTextContent>
                        <HeaderTitleContainer>
                            <h2>{postData?.title}</h2>
                            <ButtonOutContainer>
                                {session?.user?.role === 'ADMIN' ? (
                                    <>
                                        <StyledButton onClick={() => props.handleSoftDeletePost(props.postId)}>
                                            SDelete
                                        </StyledButton>
                                        <StyledButton onClick={() => props.handleDeletePost(props.postId)}>
                                            Delete
                                        </StyledButton>
                                    </>
                                ) : null}
                                <StyledButton onClick={() => props.handleClose()}>Close</StyledButton>
                                <Link href={`/post/single/${postData?.slug}`}>
                                    <SmallOutbound />
                                </Link>
                            </ButtonOutContainer>
                        </HeaderTitleContainer>
                        <p>{postData?.excerpt}</p>
                        <PostHeaderFooter>
                            <p>
                                written by: <TagDisplayPill tagValue={postData?.author.userName} tagType={'@'} />
                            </p>
                            {postData?.createdAt && <p>{format(new Date(postData?.createdAt), 'dd.MM.yyyy')}</p>}
                        </PostHeaderFooter>
                    </FullPostHeaderTextContent>
                </FullPostHeader>
                <TypographyStylesProvider style={{ fontStyle: 'Courier' }}>
                    {postData ? parser(postData?.content.htmlContent as string) : null}
                </TypographyStylesProvider>
                <PostingFooter>
                    <PostingFooterLeft>
                        <PillListInFooter>
                            {postData?.tags?.map((tag) => {
                                return (
                                    <TagDisplayPill
                                        key={tag.tagId}
                                        tagValue={tag.tag.name}
                                        tagType={'#'}
                                        withBackground={true}
                                    />
                                )
                            })}
                        </PillListInFooter>
                    </PostingFooterLeft>
                    <ButtonRow>
                        {session?.user.userName === postData?.author?.userName ? (
                            <StyledButton onClick={() => handleEditPost(postData?.id)}>Edit</StyledButton>
                        ) : null}
                        <StyledButton onClick={() => handleReplyPost(postData?.id)}>Reply</StyledButton>
                    </ButtonRow>
                </PostingFooter>

                <hr />
                <div ref={parent}>
                    {commentData?.map((comment) => {
                        return (
                            <CommentDisplay
                                key={comment.id}
                                depth={0}
                                author={comment.author}
                                content={comment.content}
                                commentId={comment.id}
                                title={comment.title}
                            />
                        )
                    })}
                </div>
            </PostBoxContent>
        </PostBox>
    )
}

export default FullPost
