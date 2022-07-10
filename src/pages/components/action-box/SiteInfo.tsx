import { Github } from '@styled-icons/bootstrap/Github'
import { Telegram } from '@styled-icons/boxicons-logos/Telegram'
import { Twitter } from '@styled-icons/boxicons-logos/Twitter'
import Image from 'next/image'
import React from 'react'
import styled from 'styled-components'

import { trpc } from '../../../utils/trpc'
import TagDisplayPill from '../common/TagDisplayPill'

const SiteInfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2em;
`

const SiteInfoFooter = styled.div`
    display: flex;
    gap: 1em;
`

export const GithubIcon = styled(Github)`
    width: 25px;
    height: 25px;
`
export const TwitterIcon = styled(Twitter)`
    width: 25px;
    height: 25px;
`
export const TelegramIcon = styled(Telegram)`
    width: 25px;
    height: 25px;
`

/* eslint-disable-next-line */
export interface SiteInfoProps {}

const SiteInfo = (props: SiteInfoProps) => {
    const { data: totalUserData } = trpc.useQuery(['meta:totalUsers'])
    const { data: totalContributionsData } = trpc.useQuery(['meta:totalContributions'])
    const { data: totalTagsData } = trpc.useQuery(['meta:totalTags'])
    const { data: totalTransactionsData } = trpc.useQuery(['meta:totalTransactions'])
    const { data: privilegedTagsData } = trpc.useQuery(['taxonomy:getPrivileged'])
    return (
        <SiteInfoContainer>
            <b>Site Info</b>
            <Image src="/logo.svg" alt="note blitz logo" width={'300px'} height={'300px'} />
            <div>
                This site has a total of <i>{totalUserData}</i> users. That have contributed{' '}
                <i>{totalContributionsData}</i> times, transacted with each other{' '}
                <i>{totalTransactionsData?.transactionCount}</i> times (with a sum value of{' '}
                <i>{totalTransactionsData?.transactionValue}</i> sats), with a total amount of <i>{totalTagsData}</i>{' '}
                tags.
            </div>
            <div>
                The mission of this site is to explore the synthesis of the <b>lightning network</b> and{' '}
                <b>web development</b> and to provide a platform for people interested in the different aspects of
                bitcoin, the web, technology and more.
            </div>
            <div>
                The following tags are privileged and are used in an administrative context:{' '}
                {privilegedTagsData
                    ? privilegedTagsData.map((tag) => {
                          return <TagDisplayPill key={tag.id} withBackground={true} tagValue={tag.name} tagType={'#'} />
                      })
                    : null}
            </div>
            <div>Do not hesitate to reach out.</div>
            <SiteInfoFooter>
                <a target="_blank" rel="noreferrer" href="https://github.com/moogmodular/note-blitz">
                    <GithubIcon />
                </a>
                <a target="_blank" rel="noreferrer" href="https://twitter.com/SchlausKwab">
                    <TwitterIcon />
                </a>
                <a target="_blank" rel="noreferrer" href="https://t.me/noteblitz">
                    <TelegramIcon />
                </a>
            </SiteInfoFooter>
        </SiteInfoContainer>
    )
}

export default SiteInfo
