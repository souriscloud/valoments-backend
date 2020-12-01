const users = require('./users/users.service.js')
const discord = require('./discord/discord.service.js');
const discordCommands = require('./discord-commands/discord-commands.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users)
  app.configure(discord);
  app.configure(discordCommands);
}
