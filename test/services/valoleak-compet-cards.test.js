const assert = require('assert');
const app = require('../../src/app');

describe('\'ValoleakCompetCards\' service', () => {
  it('registered the service', () => {
    const service = app.service('valoleak-compet-cards');

    assert.ok(service, 'Registered the service');
  });
});
