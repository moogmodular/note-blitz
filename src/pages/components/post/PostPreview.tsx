import { format } from 'date-fns'
import React, { useContext } from 'react'
import styled from 'styled-components'

import { UXContext } from '../../context/UXContext'
import TagDisplayPill from '../common/TagDisplayPill'

const PostBox = styled.div`
    display: flex;
`

const PostBoxContent = styled.div`
    padding-left: 1em;
    display: flex;
    flex-direction: column;
    width: 100%;
`

const PostingFooter = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`

const ExcerptContainer = styled.div`
    flex: 1;
`

const PostingFooterLeft = styled.div`
    display: flex;
    flex-direction: column;
`

const PillListInFooter = styled.div`
    display: flex;
    margin-bottom: 0.5em;
`

/* eslint-disable-next-line */
export interface PostPreviewProps {
    id: string
    createdAt: Date
    content: string
    headerImage: string
    title: string
    excerpt: string
    commentAmount: number
    author: string
    tags: { tag: string; tagId: string }[]
    handleExpand: () => void
}

const PostPreview = (props: PostPreviewProps) => {
    return (
        <PostBox>
            <img
                onClick={() => props.handleExpand()}
                src={props.headerImage}
                alt="header image"
                width={'250px'}
                height={'250px'}
            />
            <PostBoxContent>
                <h3 onClick={() => props.handleExpand()}>{props.title}</h3>
                <hr />
                <ExcerptContainer>{props.excerpt}</ExcerptContainer>
                <hr />
                <PostingFooter>
                    <PostingFooterLeft>
                        <PillListInFooter>
                            {props.tags.map((tag) => {
                                return (
                                    <TagDisplayPill
                                        key={tag.tagId}
                                        tagValue={tag.tag}
                                        tagType={'#'}
                                        withBackground={true}
                                    />
                                )
                            })}
                        </PillListInFooter>
                        <div style={{ display: 'flex', gap: '1em' }}>
                            <b>
                                by: <TagDisplayPill tagValue={props.author} tagType={'@'} />
                            </b>
                            <b>created: {format(props.createdAt, 'dd.MM.yyyy')}</b>
                            <b>{props.commentAmount} comments</b>
                        </div>
                    </PostingFooterLeft>
                </PostingFooter>
            </PostBoxContent>
        </PostBox>
    )
}

export default PostPreview
