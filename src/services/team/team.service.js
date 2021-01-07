// Initializes the `Team` service on path `/team`
const { Team } = require('./team.class');
const createModel = require('../../models/team.model');
const hooks = require('./team.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/team', new Team(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('team');

  service.hooks(hooks);
};
