const DiscordJS = require('discord.js')

const { loadStaticDiscordCommands } = require('../../discord-static-commands')

const MINE_GUILD_ID = '776509245432397834'
const MINE_INFO_CHANNEL_ID = '776509245432397837'

const formatPresence = presence => ({
  userId: presence.userID,
  status: presence.status,
  clientStatus: presence.clientStatus,
  username: presence.user.username,
  discriminator: presence.user.discriminator
})

const resolveDiscordColor = decimal => {
  return `#${decimal.toString(16)}`
}

/* eslint-disable no-unused-vars */
exports.Discord = class Discord {
  constructor (options) {
    this.options = options || {};
    this.events = ['commandReceived', 'presenceChanged']
    this.app = null

    this.discordIdsMap = {
      guild: MINE_GUILD_ID,
      channels: {
        info: MINE_INFO_CHANNEL_ID
      }
    }
    this.staticCommands = new DiscordJS.Collection()
    this.client = this.setupClient()

    this.getMap = {
      'roles': this.getGuildRoles,
      'members': this.getAllMembers,
      'reload-dsc': this.reloadStaticCommands,
      'dsc': this.getStaticCommands
    }
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

    const GUILDID = this.discordIdsMap.guild

    client.once('ready', () => {
      console.log(`[Discord.js]: Logged in as ${client.user.tag}`)

      const mineGuild = client.guilds.cache.get(GUILDID)
      console.log('First Presence:', mineGuild.presences.cache.map(formatPresence))
    })

    loadStaticDiscordCommands(this.staticCommands)

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
      if (oldPresence.status === newPresence.status) return

      console.log('Presence update called...   [START]')
      const INFOCHANNELID = service.discordIdsMap.channels.info

      const discordUser = newPresence.user
      service.emitPresenceChanged(formatPresence(newPresence))

      const localUserResult = await service.findDiscordLocalUser(discordUser.id)

      if (localUserResult.total === 1 && localUserResult.data) {
        console.log('is a local user, assembling message...')
        const localUser = localUserResult.data[0]

        const infoChannel = service.client.channels.cache.get(INFOCHANNELID)
        infoChannel.startTyping()
        setTimeout(() => {
          infoChannel.send(`Our member with display name \`${localUser.displayName}\` has became ${newPresence.status}, you can check him here <@${localUser.discordId}>`)
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
      const cmd = args.shift().toLowerCase()

      if (!service.staticCommands.has(cmd)) return

      try {
        service.staticCommands.get(cmd).execute(message, args, service.app)
      } catch (err) {
        console.log('error when executing static command')
        console.error(err)
        message.reply('error occurred when executing static command, check server console')
      }

      service.emitCommandReceived({ args, cmd })
    }
  }

  emitCommandReceived (command) {
    this.service.emit('commandReceived', command)
    console.log('command received emmited', command)
  }

  emitPresenceChanged (newPresence) {
    this.service.emit('presenceChanged', newPresence)
    console.log('presence changed emmited', newPresence)
  }

  async getGuildRoles ({ client = this.client }) {
    const guild = client.guilds.cache.get(MINE_GUILD_ID)

    return guild.roles.cache.map(role => ({
      id: role.id,
      name: role.name,
      managed: role.managed,
      mentionable: role.mentionable,
      deleted: role.deleted,
      color: resolveDiscordColor(role.color),
      rawPosition: role.rawPosition
    }))
  }

  async getAllMembers ({ client = this.client }) {
    const guild = client.guilds.cache.get(MINE_GUILD_ID)
    return guild.members.cache.map(member => ({
      id: member.id,
      name: member.displayName,
      color: member.displayHexColor,
      since: member.joinedAt,
      status: member.presence.status,
      clientStatus: member.presence.clientStatus,
      roles: member.roles.cache.map(role => role.name)
    }))
  }

  async getStaticCommands (ctx) {
    return ctx.staticCommands.map(dsc => ({
      name: dsc.name,
      description: dsc.description,
      command: dsc.command,
      enabled: dsc.enabled
    }))
  }

  async reloadStaticCommands (ctx) {
    loadStaticDiscordCommands(ctx.staticCommands)

    return await ctx.getStaticCommands(ctx)
  }

  async find (params) {
    return []
  }

  async get (id, params) {
    if (Object.keys(this.getMap).includes(id)) {
      return await this.getMap[id](this)
    } else {
      return {
        id, text: `A new message with ID: ${id}!`
      }
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
