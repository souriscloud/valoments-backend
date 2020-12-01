// Initializes the `DiscordCommands` service on path `/discord-commands`
const { DiscordCommands } = require('./discord-commands.class');
const createModel = require('../../models/discord-commands.model');
const hooks = require('./discord-commands.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/discord-commands', new DiscordCommands(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('discord-commands');

  service.hooks(hooks);
};
