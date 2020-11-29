const DiscordJS = require('discord.js')

/* eslint-disable no-unused-vars */
exports.Discord = class Discord {
  constructor (options) {
    this.options = options || {};
    this.client = this.setupClient()
    this.events = ['commandReceived']
    this.app = null
  }

  setup (app) {
    // not working somehow? should be called automatically by feathersjs?!?!
    this.app = app
  }

  setupService (service, app = undefined) {
    this.service = service
    if (app) {
      this.app = app
    }
  }

  setupClient () {
    const client = new DiscordJS.Client()

    const GUILDID = '776509245432397834'

    client.once('ready', () => {
      console.log(`[Discord.js]: Logged in as ${client.user.tag}`)

      const mineGuild = client.guilds.cache.get(GUILDID)
      const firstPresences = mineGuild.presences.cache.mapValues(presence => {
        const presenceUser = client.users.cache.get(presence.userID)
        return {
          userId: presence.userID,
          status: presence.status,
          clientStatus: presence.clientStatus,
          username: presenceUser.username,
          discriminator: presenceUser.discriminator
        }
      })
      console.log('First Presence:', firstPresences)
    })

    client.login(process.env.DISCORD_TOKEN)

    return client
  }

  discordEventsSetup () {
    this.client.on('message', this.handleMessages())
    this.client.on('presenceUpdate', this.handlePresenceUpdate())
  }

  async findDiscordLocalUser (discordUserId) {
    const userService = this.app.service('users')

    return await userService.find({
      query: {
        discordId: discordUserId
      }
    })
  }

  handlePresenceUpdate () {
    const service = this

    return async function (oldPresence, newPresence) {
      console.log('Presence update called...   [START]')
      const INFOCHANNELID = '776509245432397837'

      const discordUser = newPresence.user

      const localUserResult = await service.findDiscordLocalUser(discordUser.id)

      if (localUserResult.total === 1 && localUserResult.data) {
        console.log('is a local user, assembling message...')
        const localUser = localUserResult.data[0]

        const infoChannel = service.client.channels.cache.get(INFOCHANNELID)
        infoChannel.startTyping()
        setTimeout(() => {
          infoChannel.send(`Our member with email \`${localUser.email}\` has became ${newPresence.status}, you can check him here <@${localUser.discordId}>`)
          infoChannel.stopTyping()
        }, 5 * 1000)
      } else {
        console.log('not a local user, continue...')
      }
      
      console.log('Presence update called...   [END]')
      
      return
    }
  }

  handleMessages () {
    const service = this
    return function (message) {
      if (!message.content.startsWith('!') || message.author.bot) return

      const args = message.content.slice(1).trim().split(/ +/)
      const commandName = args.shift().toLowerCase()

      service.emitCommandReceived({ args, commandName })
    }
  }

  emitCommandReceived (command) {
    this.service.emit('commandReceived', command)
    console.log('command received emmited', command)
  }

  async find (params) {
    return []
  }

  async get (id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    }
  }

  async create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)))
    }

    return data
  }

  async update (id, data, params) {
    return data
  }

  async patch (id, data, params) {
    return data
  }

  async remove (id, params) {
    return { id }
  }
}
