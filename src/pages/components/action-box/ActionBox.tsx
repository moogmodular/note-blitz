import autoAnimate from '@formkit/auto-animate'
import React, { useContext, useEffect, useRef } from 'react'

import { ActionBoxAction, UXContext } from '../../context/UXContext'
import Authenticate from './Authenticate'
import EditUser from './EditUser'
import NewComment from './NewComment'
import NewPost from './NewPost'
import SiteInfo from './SiteInfo'

/* eslint-disable-next-line */
export interface ActionBoxProps {}

const ActionBox = (props: ActionBoxProps) => {
    const { state, dispatch } = useContext(UXContext)
    const parent = useRef(null)

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    return (
        <div className="h-3/4 border-2 border-black p-4" ref={parent}>
            {state.actionBoxState.actionBoxAction === ActionBoxAction.doAuth && <Authenticate />}
            {state.actionBoxState.actionBoxAction === ActionBoxAction.doNewPost && (
                <NewPost title={'New post'} data={state.actionBoxState.actionBoxData} />
            )}
            {state.actionBoxState.actionBoxAction === ActionBoxAction.doEditPost && (
                <NewPost title={'Edit post: '} data={state.actionBoxState.actionBoxData} />
            )}
            {state.actionBoxState.actionBoxAction === ActionBoxAction.doReplyToPost && (
                <NewComment title={'Reply to post: '} data={state.actionBoxState.actionBoxData} />
            )}
            {state.actionBoxState.actionBoxAction === ActionBoxAction.doReplyToComment && (
                <NewComment title={'Reply to comment: '} data={state.actionBoxState.actionBoxData} />
            )}
            {state.actionBoxState.actionBoxAction === ActionBoxAction.doEditUser && <EditUser />}
            {state.actionBoxState.actionBoxAction === ActionBoxAction.doSiteInfo && <SiteInfo />}
        </div>
    )
}

export default ActionBox
