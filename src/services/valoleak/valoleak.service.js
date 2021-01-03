// Initializes the `valoleak` service on path `/valoleak`
const { Valoleak } = require('./valoleak.class');
const hooks = require('./valoleak.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/valoleak', new Valoleak(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('valoleak');

  service.hooks(hooks);
};
