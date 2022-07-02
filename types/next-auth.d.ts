import 'next-auth'

import { User } from 'next-auth'

/** Example on how to extend the built-in session types */
declare module 'next-auth' {
    interface User {
        userName: string
        id: string
        createdAt: string
        updatedAt: string
        lastLogin: string
        publicKey: string
    }
    interface JWT {
        userName: string
        id: string
        createdAt: string
        updatedAt: string
        lastLogin: string
        publicKey: string
    }
    interface Session {
        /** This is an example. You can find me in types/next-auth.d.ts */
        user: User
        token: JWT
    }
}
