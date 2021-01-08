// Initializes the `discord` service on path `/discord`
const { Discord } = require('./discord.class')
const hooks = require('./discord.hooks')

module.exports = function (app) {
  // const discord = new Discord()

  // // Initialize our service with any options it requires
  // app.use('/discord', discord)

  // // Get our initialized service so that we can register hooks
  // const service = app.service('discord')

  // // Initialize discord things right after the service was created
  // discord.setupService(service, app)
  // discord.discordEventsSetup()

  // service.hooks(hooks)
};
