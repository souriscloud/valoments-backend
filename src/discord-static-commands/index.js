const DiscordJS = require('discord.js')
const fs = require('fs')
const path = require('path')

const loadStaticDiscordCommands = (targetCollection = new DiscordJS.Collection()) => {
  console.log('Loading STATIC Discord commands...')
  targetCollection.clear()
  const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.dsc.js'))
  for (const file of commandFiles) {
    const command = require(path.join(__dirname, file))

    console.log(`+dsc\t${command.command}\t${command.name}\t${file}`)

    targetCollection.set(command.command, command)
  }
}

module.exports = {
  loadStaticDiscordCommands
}
