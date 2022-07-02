import { Prisma } from '@prisma/client'

export const tagsMock: Prisma.TagCreateManyInput[] = [
  {
    name: 'ln-webdev',
  },
  {
    name: 'politics',
  },
  {
    name: 'bitcoin',
  },
  {
    name: 'shitcoins',
  },
  {
    name: 'socialmedia',
  },
  {
    name: 'finance',
  },
]
