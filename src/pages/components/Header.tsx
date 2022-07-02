import { Button } from '@mui/material'
import { User } from '@styled-icons/boxicons-regular/User'
import { Flash } from '@styled-icons/entypo/Flash'
import { LockOpen } from '@styled-icons/material/LockOpen'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'

import { trpc } from '../../utils/trpc'
import { ActionBoxAction, UXActionTypes, UXContext } from '../context/UXContext'

const StyledButton = styled(Button)`
    background: transparent;
    font-size: 1rem;
    border: 2px solid #000000;
    border-radius: 0;
    color: #000000;
    padding: 0.25em 1em;
    margin-left: auto;
`

export const SmallFlash = styled(Flash)`
    width: 25px;
    height: 25px;
    color: chartreuse;
`

export const LockIcon = styled(LockOpen)`
    width: 35px;
    height: 35px;
    margin-left: 1em;
`

export const UserImage = styled.img`
    width: 35px;
    height: 35px;
    color: brown;
    margin-left: 1em;
    margin-right: 1em;
`

export const UserIcon = styled(User)`
    width: 35px;
    height: 35px;
    color: brown;
    margin-left: 1em;
    margin-right: 1em;
`

const HeaderContainer = styled.div`
    border: 3px solid #000;
    display: flex;
    justify-content: space-between;
    padding: 0.7em;
`

const LogoContainer = styled.div`
    display: flex;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
`

const UserContainer = styled.div`
    display: flex;
`

const AuthenticatedUserData = styled.div`
    font-size: 0.9em;
`

/* eslint-disable-next-line */

export interface HeaderProps {}

const Header = (props: HeaderProps) => {
    const { state: uxState, dispatch: uxDispatch } = useContext(UXContext)

    const [fullUser, setFullUser] = useState<{ userName: string; profileImage?: string; publicKey: string }>()

    const { data: session } = useSession()

    const { data: meUserData } = trpc.useQuery(['user:getMe'], {
        onSuccess: (data) => {
            if (data?.userName) {
                setFullUser({ ...data, profileImage: data.profileImage ?? '' })
            } else {
                void signOut()
            }
        },
    })

    useEffect(() => {
        if (!session) {
            uxDispatch({
                type: UXActionTypes.SetActionBox,
                payload: {
                    actionBoxAction: ActionBoxAction.doAuth,
                },
            })
        }
    }, [session])

    const handleUserCLick = () => {
        uxDispatch({
            type: UXActionTypes.SetActionBox,
            payload: {
                actionBoxAction: ActionBoxAction.doEditUser,
            },
        })
    }

    const handleLogoCLick = () => {
        uxDispatch({
            type: UXActionTypes.SetActionBox,
            payload: {
                actionBoxAction: ActionBoxAction.doSiteInfo,
            },
        })
    }

    const handleAuthClick = () => {
        uxDispatch({
            type: UXActionTypes.SetActionBox,
            payload: {
                actionBoxAction: ActionBoxAction.doAuth,
            },
        })
    }

    const handleNewPost = () => {
        uxDispatch({
            type: UXActionTypes.SetActionBox,
            payload: {
                actionBoxAction: ActionBoxAction.doNewPost,
            },
        })
    }

    return (
        <HeaderContainer>
            <LogoContainer>
                <Image onClick={handleLogoCLick} src="/logo.svg" alt="note blitz logo" width={'60px'} height={'60px'} />
                <UserContainer onClick={handleUserCLick}>
                    {fullUser ? (
                        <>
                            {fullUser.profileImage ? (
                                <UserImage
                                    onClick={handleLogoCLick}
                                    src={fullUser.profileImage}
                                    alt="note blitz logo"
                                    width={'45px'}
                                    height={'45px'}
                                />
                            ) : (
                                <UserIcon />
                            )}

                            <AuthenticatedUserData>
                                <div>@{fullUser.userName}</div>
                                <div>{fullUser.publicKey}</div>
                            </AuthenticatedUserData>
                        </>
                    ) : null}
                </UserContainer>
                {session ? <StyledButton onClick={() => handleNewPost()}>New Post</StyledButton> : null}
            </LogoContainer>
        </HeaderContainer>
    )
}

export default Header
