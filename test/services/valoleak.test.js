const assert = require('assert');
const app = require('../../src/app');

describe('\'valoleak\' service', () => {
  it('registered the service', () => {
    const service = app.service('valoleak');

    assert.ok(service, 'Registered the service');
  });
});
