const assert = require('assert');
const app = require('../../src/app');

describe('\'Team\' service', () => {
  it('registered the service', () => {
    const service = app.service('team');

    assert.ok(service, 'Registered the service');
  });
});
