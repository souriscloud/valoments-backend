// Initializes the `tournaments` service on path `/tournaments`
const { Tournaments } = require('./tournaments.class');
const createModel = require('../../models/tournaments.model');
const hooks = require('./tournaments.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/tournaments', new Tournaments(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('tournaments');

  service.hooks(hooks);
};
