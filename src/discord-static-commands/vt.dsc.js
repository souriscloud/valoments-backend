const DiscordJS = require('discord.js')

const MINE_VALOMENTS_CATEGORYCHANNEL = '776516766272716880'

module.exports = {
  name: 'Valoments Test',
  description: 'This static command is for testing purposes.',

  command: 'vt',
  enabled: true,

  onlyStaff: true,
  onlyInParentId: MINE_VALOMENTS_CATEGORYCHANNEL,

  execute (message = new DiscordJS.Message(), args = [], app = null) {
    // message.reply(`VALTEST! args: [${args.join(', ')}]`)

    app.service('discord').createValomentsChannel(1, 3).then(guildChannel => {
      console.log('GUILD CHANNEL HAS BEEN CREATED!', 'ID:', guildChannel.id)
    }).catch(e => console.error(e))
  }
}
