import { format } from 'date-fns'
import React from 'react'

import { trpc } from '../../utils/trpc'
import PublicKeyDisplayPill from './common/PublicKeyDisplayPill'
import TagDisplayPill from './common/TagDisplayPill'

/* eslint-disable-next-line */
export interface UserListProps {}

const UserList = (props: UserListProps) => {
    const { data } = trpc.useQuery(['user:getAll'])

    return (
        <div className="flex flex-col">
            {data
                ? data.map((user) => {
                      return (
                          <div className="mb-2 flex flex-row" key={user.id}>
                              <div className="w-52">
                                  <TagDisplayPill tagValue={user.userName} tagType={'@'} />
                              </div>
                              <div className="w-24">
                                  <b>{user.contentItems} Posts</b>
                              </div>

                              <div className="w-32">
                                  <p>{format(new Date(user.createdAt), 'dd.MM.yyyy')}</p>
                              </div>
                              <PublicKeyDisplayPill publicKey={user.publicKey} />
                          </div>
                      )
                  })
                : null}
        </div>
    )
}

export default UserList
