const assert = require('assert');
const app = require('../../src/app');

describe('\'tournaments\' service', () => {
  it('registered the service', () => {
    const service = app.service('tournaments');

    assert.ok(service, 'Registered the service');
  });
});
