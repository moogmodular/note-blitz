import { format } from 'date-fns'
import { useRouter } from 'next/router'
import React from 'react'
import styled from 'styled-components'

import { trpc } from '../../utils/trpc'

export const UserSiteMetaContext = ({ user }: { user: string }) => {
    const { data: userData } = trpc.useQuery(['user:publicInfoByName', { name: user }])
    return (
        <>
            {userData ? (
                <>
                    <b>Name: {userData.userName}</b>
                    <b>Member since: {format(new Date(userData.createdAt as unknown as string), 'dd.MM.yyyy')}</b>
                    <b>earned {userData.totalEarned} sats</b>
                    <p>contributed {userData.totalContributions} times</p>
                </>
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
                    // tag: <PostTimeline tag={router.query.tag as string} />,
                    user: <UserSiteMetaContext user={router.query.user as string} />,
                    // timeline: <PostTimeline />,
                }[routerPath(router.asPath)]
            }
        </SiteMetaContextPropsContainer>
    )
}

export default SiteMetaContext
