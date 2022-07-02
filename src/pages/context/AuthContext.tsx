import React, { createContext, useReducer } from 'react'

export enum AuthActionTypes {
    SetUserPublicKey = 'SET_USER_PUBLIC_KEY',
    SetJwtUser = 'SET_JWT_USER',
    LogOut = 'LOG_OUT',
    SetLnUrlLogin = 'SET_LN_URL_LOGIN',
    UnSetLnUrlLogin = 'UN_SET_LN_URL_LOGIN',
}

interface AuthAction {
    type: typeof AuthActionTypes[keyof typeof AuthActionTypes]
    payload?: any
}

export interface AuthenticatedUser {
    id: string
    createdAt: Date
    updatedAt: Date
    lastLogin?: Date
    hash: string
    publicKey: string
    userName: string
    iat: number
    exp: number
}

export interface IAuthContext {
    userPublicKey: string
    userTokenData?: AuthenticatedUser
    lnLoginUrl?: string
}

const reducer = (state: IAuthContext, action: AuthAction) => {
    switch (action.type) {
        case AuthActionTypes.SetUserPublicKey:
            return {
                ...state,
                userPublicKey: action.payload,
            }
        case AuthActionTypes.SetJwtUser:
            return {
                ...state,
                userTokenData: action.payload,
            }
        case AuthActionTypes.LogOut:
            // @ts-ignore
            localStorage.removeItem('token')
            return {
                ...state,
                userTokenData: null,
            }
        case AuthActionTypes.UnSetLnUrlLogin:
            localStorage.removeItem('lnUrlLogin')
            return {
                ...state,
                lnLoginUrl: null,
            }
        case AuthActionTypes.SetLnUrlLogin:
            localStorage.setItem('lnUrlLogin', action.payload)
            return {
                ...state,
                lnLoginUrl: action.payload,
            }
        default:
            return state
    }
}

const initialState: IAuthContext = {
    userPublicKey: '',
}

export const AuthContext = createContext<{
    state: IAuthContext
    dispatch: React.Dispatch<any>
}>({ state: initialState, dispatch: () => null })

export const AuthProvider = ({ children }: any) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>
}
