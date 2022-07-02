import { Config, adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator'

import { prisma } from '../context'
import { lnUrlService } from './lightning'

export const doAuthEvent = () => {
  lnUrlService.on('login', async (event: { key: string; hash: string }) => {
    const login = await prisma.lnAuth.create({
      data: {
        k1: event.hash,
        publicKey: event.key,
        used: false,
      },
    })

    let user = await prisma.user.findFirst({ where: { publicKey: event.key } })

    if (!user) {
      const customConfig: Config = {
        dictionaries: [adjectives, colors, animals],
        separator: '',
        length: 3,
        style: 'capital',
      }
      const randomName: string = uniqueNamesGenerator(customConfig)
      user = await prisma.user.create({
        data: {
          publicKey: event.key,
          userName: randomName,
          lnAuth: { connect: { id: login.id } },
        },
        include: {
          lnAuth: true,
        },
      })
    } else {
      await prisma.user.update({ where: { id: user.id }, data: { lnAuth: { connect: { id: login.id } } }, include: { lnAuth: true } })
    }
  })
}
