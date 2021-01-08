// Initializes the `ValoleakCompetCards` service on path `/valoleak-compet-cards`
const { ValoleakCompetCards } = require('./valoleak-compet-cards.class');
const createModel = require('../../models/valoleak-compet-cards.model');
const hooks = require('./valoleak-compet-cards.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('/valoleak-compet-cards', new ValoleakCompetCards(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('valoleak-compet-cards');

  service.hooks(hooks);
};
