import React, { createContext, useReducer } from 'react'

export enum UXActionTypes {
    SetActionBox = 'SET_ACTION_BOX',
}

interface UXAction {
    type: typeof UXActionTypes[keyof typeof UXActionTypes]
    payload?: any
}

export interface IUXContext {
    actionBoxState: ActionBoxState
}

export interface ActionBoxState {
    actionBoxAction: ActionBoxAction
    actionBoxData?: string
}

export enum ActionBoxAction {
    doAuth,
    doNewPost,
    doEditPost,
    doReplyToPost,
    doReplyToComment,
    doEditUser,
    doSiteInfo,
}

const reducer = (state: IUXContext, action: UXAction) => {
    switch (action.type) {
        case UXActionTypes.SetActionBox:
            return {
                ...state,
                actionBoxState: action.payload,
            }

        default:
            return state
    }
}

const initialState: IUXContext = {
    actionBoxState: {
        actionBoxAction: ActionBoxAction.doNewPost,
    },
}

export const UXContext = createContext<{
    state: IUXContext
    dispatch: React.Dispatch<any>
}>({ state: initialState, dispatch: () => null })

export const UXProvider = ({ children }: any) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    return <UXContext.Provider value={{ state, dispatch }}>{children}</UXContext.Provider>
}
