import { format } from 'date-fns'
import { useRouter } from 'next/router'
import React from 'react'

import { trpc } from '../../utils/trpc'

export const MeSiteMetaContext = () => {
    const { data: meData } = trpc.useQuery(['user:getMe'])

    return (
        <>
            {meData ? (
                <div className="flex flex-col">
                    <div>Me: @{meData.userName}</div>
                    <div>here since: {format(new Date(meData.createdAt as unknown as string), 'dd.MM.yyyy')}</div>
                    <div>i was mentioned: {meData.totalMentioned} times</div>
                    <div>i have contributed: {meData.totalContributions} times</div>
                </div>
            ) : null}
        </>
    )
}

export const TagSiteMetaContext = ({ tag }: { tag: string }) => {
    const { data: tagData } = trpc.useQuery(['taxonomy:getTagInfoByName', { tagName: tag }])

    return (
        <>
            {tagData ? (
                <div className="flex flex-col">
                    <div>Tag: {tagData.name}</div>
                    <div>
                        First appearance: {format(new Date(tagData.createdAt as unknown as string), 'dd.MM.yyyy')}
                    </div>
                    <div>mentioned: {tagData.contentItemCount} times</div>
                    <div>is privileged: {tagData.privileged ? 'yes' : 'no'}</div>
                </div>
            ) : null}
        </>
    )
}

export const UserSiteMetaContext = ({ user }: { user: string }) => {
    const { data: userData } = trpc.useQuery(['user:publicInfoByName', { name: user }])
    return (
        <>
            {userData ? (
                <div className="flex flex-col">
                    <div>Name: {userData.userName}</div>
                    <div>Member since: {format(new Date(userData.createdAt as unknown as string), 'dd.MM.yyyy')}</div>
                    <div>earned {userData.totalEarned} sats</div>
                    <div>contributed {userData.totalContributions} times</div>
                </div>
            ) : null}
        </>
    )
}

/* eslint-disable-next-line */
export interface SiteMetaContextProps {}

const SiteMetaContext = (props: SiteMetaContextProps) => {
    const router = useRouter()

    const routerPath = (path: any): string => {
        const subPath = path.split('/')[2]
        if (!subPath) {
            return 'timeline'
        }
        return path.split('/')[2]
    }

    return (
        <div>
            {
                {
                    // single: <IsolatedPost slug={router.query.slug as string} />,
                    tag: <TagSiteMetaContext tag={router.query.tag as string} />,
                    user: <UserSiteMetaContext user={router.query.user as string} />,
                    timeline: <MeSiteMetaContext />,
                }[routerPath(router.asPath)]
            }
        </div>
    )
}

export default SiteMetaContext
