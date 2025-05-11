import 'next-auth'
import { DefaultSession } from 'next-auth'
import { Role } from '@prisma/client'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: Role
  }

  interface Session {
    user: {
      id: string
      role: Role
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
  }
} 