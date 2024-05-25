import { Client, EmbedBuilder, Guild, TextBasedChannel } from 'discord.js'
import { chunkify, sleep } from './utils'
import { IOrg, IMember, IRole } from './models'

const initOrg = async (client: Client, org: IOrg) => {
  const guild = client.guilds.cache.get(org.channelId)
  if (!guild) {
    throw new Error('No such channel for org: ')
  }

  const roles = await getRoles(guild)
  const members = await getMembers(guild)

  for (const dep of org.departments) {
    const target = await client.channels.fetch(dep.channelId)
    if (!target?.isTextBased()) {
      continue
    }

    const groupedMembers = getMembersByRoles(members, dep.roles)

    const embeds = generateEmbeds(groupedMembers, roles)

    if (!embeds.length) {
      continue
    }

    await clearChat(target)

    const chunkedEmbeds = chunkify(embeds, 9)

    chunkedEmbeds.forEach(async chunked => {
      await target.send({ embeds: [...chunked] })
    })

    await sleep(2000)
  }
}

export const init = async (client: Client, orgs: IOrg[]) => {
  for (const org of orgs) {
    initOrg(client, org).catch(e => console.error(e))
  }
}

const getRoles = async (guild: Guild): Promise<IRole[]> => {
  const roles = await guild.roles.fetch()
  return roles.map(role => ({ id: role.id, name: role.name })).filter(el => el.name !== '@everyone')
}

const getMembers = async (guild: Guild): Promise<IMember[]> => {
  const members = await guild.members.fetch()
  return members.map(member => ({
    id: member.id,
    displayName: member.displayName,
    roles: member.roles.cache.map(role => ({ id: role.id, name: role.name })),
  }))
}

const getMembersByRoles = (members: IMember[], roles: string[]): Record<string, IMember[]> => {
  const departmentMembers = members.filter(member =>
    member.roles.some(role => roles.includes(role.id)),
  )
  const hash: Record<string, IMember[]> = {}

  for (const role of roles) {
    hash[role] = []
  }

  for (const member of departmentMembers) {
    for (const role of roles) {
      if (member.roles.map(el => el.id).includes(role)) {
        hash[role].push(member)
        break
      }
    }
  }

  return hash
}

const generateEmbeds = (groupedMembers: Record<string, IMember[]>, roles: IRole[]) => {
  const embeds = []

  for (const [role, members] of Object.entries(groupedMembers)) {
    const foundRole = roles.find(el => el.id === role)
    if (!foundRole) {
      continue
    }

    const chunkedMembers = chunkify(members, 15)
    for (const chunk of chunkedMembers) {
      embeds.push(
        new EmbedBuilder().setTitle(foundRole.name).setDescription(
          chunk.reduce((acc, cur, idx) => {
            acc += `${idx + 1}. <@${cur.id}> - ${cur.displayName} \n`
            return acc
          }, ''),
        ),
      )
    }
  }

  const total = Object.values(groupedMembers).reduce((acc, cur) => {
    acc += cur.length
    return acc
  }, 0)

  embeds.push(
    new EmbedBuilder().setTitle('Общее число сотрудников').setDescription(total.toString()),
  )

  return embeds
}

const clearChat = async (chat: TextBasedChannel) => {
  const tagret = await chat.messages.fetch()
  tagret.forEach(async msg => await msg.delete())
}
