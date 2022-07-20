import React from 'react'

import { trpc } from '../../utils/trpc'
import TagDisplayPill from './common/TagDisplayPill'

/* eslint-disable-next-line */
export interface TaxonomyListProps {}

const TaxonomyList = (props: TaxonomyListProps) => {
    const { data } = trpc.useQuery(['taxonomy:getTaxonomyStats'])

    return (
        <div className="flex flex-col">
            {data
                ? data.map((taxonomy) => {
                      return (
                          <div className="mb-2 flex flex-row" key={taxonomy.tagId}>
                              <div className="w-40">
                                  <TagDisplayPill tagType={'#'} withBackground={true} tagValue={taxonomy.tagName} />
                              </div>
                              <b>Post Count: {taxonomy.postCount}</b>
                          </div>
                      )
                  })
                : null}
        </div>
    )
}

export default TaxonomyList
