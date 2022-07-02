import { format } from 'date-fns'
import React from 'react'
import styled from 'styled-components'

import { trpc } from '../../utils/trpc'
import PublicKeyDisplayPill from './common/PublicKeyDisplayPill'

const UserListPropsContainer = styled.div``

const UserPreviewLine = styled.div`
  display: flex;
  height: 2rem;
  align-items: center;

  > * {
    margin-right: 1em;
  }
`

/* eslint-disable-next-line */
export interface UserListProps {}

const UserList = (props: UserListProps) => {
  const { data } = trpc.useQuery(['user:getAll'])

  return (
    <UserListPropsContainer>
      {data
        ? data.map((user) => {
            return (
                <UserPreviewLine key={user.id}>
                    <b>{user.userName}</b>
                    <b>{user.posts} Posts</b>
                    <p>{format(new Date(user.createdAt), 'dd.MM.yyyy')}</p>
                    <PublicKeyDisplayPill publicKey={user.publicKey} />
                </UserPreviewLine>
            )
          })
        : null}
    </UserListPropsContainer>
  )
}

export default UserList
