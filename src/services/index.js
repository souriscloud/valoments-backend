const users = require('./users/users.service.js')
const discord = require('./discord/discord.service.js');
const discordCommands = require('./discord-commands/discord-commands.service.js');
const tournaments = require('./tournaments/tournaments.service.js');
const valoleak = require('./valoleak/valoleak.service.js');
const player = require('./player/player.service.js');
const team = require('./team/team.service.js');
const match = require('./match/match.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users)
  app.configure(discord);
  app.configure(discordCommands);
  app.configure(tournaments);
  app.configure(valoleak);
  app.configure(player);
  app.configure(team);
  app.configure(match);
}
