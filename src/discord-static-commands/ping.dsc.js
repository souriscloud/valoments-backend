const DiscordJS = require('discord.js')

module.exports = {
  name: 'Ping',
  description: 'This static command is just demonstrating basic usage.',

  command: 'ping',
  enabled: true,

  execute (message = new DiscordJS.Message(), args = []) {
    message.reply(`Pong! args: [${args.join(', ')}]`)
  }
}
