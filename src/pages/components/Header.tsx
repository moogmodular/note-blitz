import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import React, { useContext, useEffect, useState } from 'react'

import { trpc } from '../../utils/trpc'
import { ActionBoxAction, UXActionTypes, UXContext } from '../context/UXContext'
import BorderedButton from './BorderedButton'

/* eslint-disable-next-line */

export interface HeaderProps {}

const Header = (props: HeaderProps) => {
    const { state: uxState, dispatch: uxDispatch } = useContext(UXContext)

    const [fullUser, setFullUser] = useState<{ userName: string; profileImage?: string; publicKey: string }>()

    const { data: session } = useSession()

    const mutation = trpc.useMutation(['lightning:nodeBalance'])

    const { data: meUserData, remove } = trpc.useQuery(['user:getMe'], {
        onSuccess: (data) => {
            if (data?.userName) {
                setFullUser({
                    ...data,
                    publicKey: data.publicKey ?? '',
                    userName: data.userName ?? '',
                    profileImage: data.profileImage ?? '',
                })
            } else {
                void signOut()
            }
        },
        onError: (err) => {
            console.log(err)
        },
    })

    useEffect(() => {
        mutation.mutate()
        if (!session?.user) {
            uxDispatch({
                type: UXActionTypes.SetActionBox,
                payload: {
                    actionBoxAction: ActionBoxAction.doAuth,
                },
            })
        } else {
            uxDispatch({
                type: UXActionTypes.SetActionBox,
                payload: {
                    actionBoxAction: ActionBoxAction.doNewPost,
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

    const handleNewPost = () => {
        uxDispatch({
            type: UXActionTypes.SetActionBox,
            payload: {
                actionBoxAction: ActionBoxAction.doNewPost,
            },
        })
    }

    const handleGetBalance = async () => {
        const test = await mutation.mutateAsync()
        console.log(test)
    }

    return (
        <div className="border-2 border-black p-4">
            <div className="flex flex-row items-center">
                <Image onClick={handleLogoCLick} src="/logo.svg" alt="note blitz logo" width={'60px'} height={'60px'} />
                <div className="flex flex-row items-center" onClick={handleUserCLick}>
                    {fullUser ? (
                        <>
                            {fullUser.profileImage ? (
                                <img
                                    className="ml-4 mr-4 h-12 w-12"
                                    onClick={handleLogoCLick}
                                    src={fullUser.profileImage}
                                    alt="note blitz logo"
                                    width={'45px'}
                                    height={'45px'}
                                />
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            )}

                            <div className="hidden flex-col text-base 2xl:flex">
                                <div>@{fullUser.userName}</div>
                                <div>{fullUser.publicKey}</div>
                            </div>
                        </>
                    ) : null}
                </div>
                <div className="ml-auto">
                    {session ? <BorderedButton buttonText={'New Post'} action={handleNewPost} /> : null}
                </div>
                {/*<BorderedButton buttonText={'Get Balance'} action={handleGetBalance} />*/}
            </div>
        </div>
    )
}

export default Header
