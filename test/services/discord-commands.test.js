const assert = require('assert');
const app = require('../../src/app');

describe('\'DiscordCommands\' service', () => {
  it('registered the service', () => {
    const service = app.service('discord-commands');

    assert.ok(service, 'Registered the service');
  });
});
