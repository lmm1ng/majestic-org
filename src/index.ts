import { Client, Events, GatewayIntentBits } from 'discord.js'
import { Config } from './config'
import { init } from './core'
// import lspd_8 from './orgs/8/lspd'
import ems_8 from './orgs/8/ems'
// import { CronJob } from 'cron'

const config = new Config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
})

const orgs = [ems_8]

client.once(Events.ClientReady, readyClient => {
  init(readyClient, orgs).catch(() => console.log('Error on init orgs'))
})

// const job = new CronJob('0 */3 * * *', () => {
//   init(client, orgs).catch(() => console.log('Error on init orgs in cron'))
// })

client.login(config.get('TOKEN'))
// job.start()
