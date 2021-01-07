const assert = require('assert');
const app = require('../../src/app');

describe('\'Match\' service', () => {
  it('registered the service', () => {
    const service = app.service('match');

    assert.ok(service, 'Registered the service');
  });
});
