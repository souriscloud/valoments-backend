// Initializes the `Match` service on path `/match`
const { Match } = require('./match.class');
const createModel = require('../../models/match.model');
const hooks = require('./match.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/match', new Match(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('match');

  service.hooks(hooks);
};
