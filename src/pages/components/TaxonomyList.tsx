import React from 'react'
import styled from 'styled-components'

import { trpc } from '../../utils/trpc'
import TagDisplayPill from './common/TagDisplayPill'

const TaxonomyListPropsContainer = styled.div``

/* eslint-disable-next-line */
export interface TaxonomyListProps {}

const TaxonomyList = (props: TaxonomyListProps) => {
    const { data } = trpc.useQuery(['taxonomy:getTaxonomyStats'])

    return (
        <TaxonomyListPropsContainer>
            {data
                ? data.map((taxonomy) => {
                      return (
                          <div key={taxonomy.tagId}>
                              <TagDisplayPill tagType={'#'} withBackground={true} tagValue={taxonomy.tagName} />
                              <b>Post Count: {taxonomy.postCount}</b>
                          </div>
                      )
                  })
                : null}
        </TaxonomyListPropsContainer>
    )
}

export default TaxonomyList
