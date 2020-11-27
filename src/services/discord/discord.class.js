const DiscordJS = require('discord.js')

/* eslint-disable no-unused-vars */
exports.Discord = class Discord {
  constructor (options) {
    this.options = options || {};
    this.client = this.setupClient()
    this.events = ['commandReceived']
  }

  setup (app) {
    this.app = app
  }

  setupClient () {
    const client = new DiscordJS.Client()

    client.once('ready', () => {
      console.log(`[Discord.js]: Logged in as ${client.user.tag}`)
    })

    client.login(process.env.DISCORD_TOKEN)

    return client
  }

  setupService (service) {
    this.service = service
  }

  setupMessageHandling () {
    this.client.on('message', this.handleMessages(this.client))
  }

  handleMessages (client) {
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
