const assert = require('assert');
const app = require('../../src/app');

describe('\'Player\' service', () => {
  it('registered the service', () => {
    const service = app.service('player');

    assert.ok(service, 'Registered the service');
  });
});
