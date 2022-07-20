import Image from 'next/image'
import React from 'react'

import { trpc } from '../../../utils/trpc'
import TagDisplayPill from '../common/TagDisplayPill'

/* eslint-disable-next-line */
export interface SiteInfoProps {}

const SiteInfo = (props: SiteInfoProps) => {
    const { data: totalUserData } = trpc.useQuery(['meta:totalUsers'])
    const { data: totalContributionsData } = trpc.useQuery(['meta:totalContributions'])
    const { data: totalTagsData } = trpc.useQuery(['meta:totalTags'])
    const { data: totalTransactionsData } = trpc.useQuery(['meta:totalTransactions'])
    const { data: privilegedTagsData } = trpc.useQuery(['taxonomy:getPrivileged'])
    return (
        <div className="flex h-full flex-col items-center justify-between">
            <b>Site Info</b>
            <Image src="/logo.svg" alt="note blitz logo" width={'200px'} height={'200px'} />
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
                The following tags are privileged and are used in an administrative context:
                <span className="inline-block">
                    {privilegedTagsData
                        ? privilegedTagsData.map((tag) => {
                              return (
                                  <TagDisplayPill
                                      key={tag.id}
                                      withBackground={true}
                                      tagValue={tag.name}
                                      tagType={'#'}
                                  />
                              )
                          })
                        : null}
                </span>
            </div>
            <div>Do not hesitate to reach out.</div>
            <div className="flex flex-row">
                <a target="_blank" rel="noreferrer" href="https://github.com/moogmodular/note-blitz">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                </a>
                <a target="_blank" rel="noreferrer" href="https://twitter.com/SchlausKwab">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                </a>
                <a target="_blank" rel="noreferrer" href="https://t.me/noteblitz">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path
                            id="telegram-1"
                            d="M18.384,22.779c0.322,0.228 0.737,0.285 1.107,0.145c0.37,-0.141 0.642,-0.457 0.724,-0.84c0.869,-4.084 2.977,-14.421 3.768,-18.136c0.06,-0.28 -0.04,-0.571 -0.26,-0.758c-0.22,-0.187 -0.525,-0.241 -0.797,-0.14c-4.193,1.552 -17.106,6.397 -22.384,8.35c-0.335,0.124 -0.553,0.446 -0.542,0.799c0.012,0.354 0.25,0.661 0.593,0.764c2.367,0.708 5.474,1.693 5.474,1.693c0,0 1.452,4.385 2.209,6.615c0.095,0.28 0.314,0.5 0.603,0.576c0.288,0.075 0.596,-0.004 0.811,-0.207c1.216,-1.148 3.096,-2.923 3.096,-2.923c0,0 3.572,2.619 5.598,4.062Zm-11.01,-8.677l1.679,5.538l0.373,-3.507c0,0 6.487,-5.851 10.185,-9.186c0.108,-0.098 0.123,-0.262 0.033,-0.377c-0.089,-0.115 -0.253,-0.142 -0.376,-0.064c-4.286,2.737 -11.894,7.596 -11.894,7.596Z"
                        />
                    </svg>
                </a>
            </div>
        </div>
    )
}

export default SiteInfo
