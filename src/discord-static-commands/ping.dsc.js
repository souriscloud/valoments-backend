const DiscordJS = require('discord.js')

module.exports = {
  name: 'Ping',
  description: 'This static command is just demonstrating basic usage.',

  command: 'ping',
  enabled: true,

  onlyStaff: false,
  onlyInParentId: false,

  execute (message = new DiscordJS.Message(), args = [], app = null) {
    message.reply(`Pong! args: [${args.join(', ')}]`)
  }
}
