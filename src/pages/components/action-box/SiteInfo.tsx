import React from 'react'
import styled from 'styled-components'

import { trpc } from '../../../utils/trpc'

const SiteInfoContainer = styled.div``

/* eslint-disable-next-line */
export interface SiteInfoProps {}

const SiteInfo = (props: SiteInfoProps) => {
    const { data: nodeBalancerData } = trpc.useQuery(['lightning:getNodeBalance'])

    return (
        <SiteInfoContainer>
            <b>Site Info</b>
            <i>
                The current balance of this node is <b>{nodeBalancerData} Sats</b>
            </i>
        </SiteInfoContainer>
    )
}

export default SiteInfo
