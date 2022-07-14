import {format} from 'date-fns'
import {useRouter} from 'next/router'
import React from 'react'
import styled from 'styled-components'

import {trpc} from '../../utils/trpc'

const MetaLine = styled.div`
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
`

const MetaColumn = styled.div`
    display: flex;
    flex-direction: column;
`

export const MeSiteMetaContext = () => {
    const { data: meData } = trpc.useQuery(['user:getMe'])

    return (
        <>
            {meData ? (
                <MetaColumn>
                    <MetaLine>
                        <b>Me: @{meData.userName}</b>
                        <b>here since: {format(new Date(meData.createdAt as unknown as string), 'dd.MM.yyyy')}</b>
                    </MetaLine>
                    <MetaLine>
                        <b>im mentioned {meData.totalMentioned} times</b>
                        <b>i have contributed: {meData.totalContributions} times</b>
                    </MetaLine>
                    <MetaLine>
                        <b>i was mentioned: {meData.totalMentioned} times</b>
                    </MetaLine>
                </MetaColumn>
            ) : null}
        </>
    )
}

export const TagSiteMetaContext = ({ tag }: { tag: string }) => {
    const { data: tagData } = trpc.useQuery(['taxonomy:getTagInfoByName', { tagName: tag }])

    return (
        <>
            {tagData ? (
                <MetaColumn>
                    <MetaLine>
                        <b>Tag: {tagData.name}</b>
                        <b>
                            First appearance: {format(new Date(tagData.createdAt as unknown as string), 'dd.MM.yyyy')}
                        </b>
                    </MetaLine>
                    <MetaLine>
                        <b>mentioned {tagData.contentItemCount} times</b>
                        <b>is privileged: {tagData.privileged ? 'yes' : 'no'}</b>
                    </MetaLine>
                </MetaColumn>
            ) : null}
        </>
    )
}

export const UserSiteMetaContext = ({ user }: { user: string }) => {
    const { data: userData } = trpc.useQuery(['user:publicInfoByName', { name: user }])
    return (
        <>
            {userData ? (
                <MetaColumn>
                    <MetaLine>
                        <b>Name: {userData.userName}</b>
                        <b>Member since: {format(new Date(userData.createdAt as unknown as string), 'dd.MM.yyyy')}</b>
                    </MetaLine>
                    <MetaLine>
                        <b>earned {userData.totalEarned} sats</b>
                        <b>contributed {userData.totalContributions} times</b>
                    </MetaLine>
                </MetaColumn>
            ) : null}
        </>
    )
}

const SiteMetaContextPropsContainer = styled.div``

/* eslint-disable-next-line */
export interface SiteMetaContextProps {}

const SiteMetaContext = (props: SiteMetaContextProps) => {
    const { data } = trpc.useQuery(['taxonomy:getTaxonomyStats'])
    const router = useRouter()

    const routerPath = (path: any): string => {
        const subPath = path.split('/')[2]
        if (!subPath) {
            return 'timeline'
        }
        return path.split('/')[2]
    }

    return (
        <SiteMetaContextPropsContainer>
            {
                {
                    // single: <IsolatedPost slug={router.query.slug as string} />,
                    tag: <TagSiteMetaContext tag={router.query.tag as string} />,
                    user: <UserSiteMetaContext user={router.query.user as string} />,
                    timeline: <MeSiteMetaContext />,
                }[routerPath(router.asPath)]
            }
        </SiteMetaContextPropsContainer>
    )
}

export default SiteMetaContext
