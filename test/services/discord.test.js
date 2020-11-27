const assert = require('assert');
const app = require('../../src/app');

describe('\'discord\' service', () => {
  it('registered the service', () => {
    const service = app.service('discord');

    assert.ok(service, 'Registered the service');
  });
});
