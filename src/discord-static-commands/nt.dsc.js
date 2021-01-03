const DiscordJS = require('discord.js')

module.exports = {
  name: 'New Tournament',
  description: 'Create new tournament. Arguments: Title,Description,Code',

  command: 'nt',
  enabled: true,

  execute (message = new DiscordJS.Message(), args = [], app = null) {
    if (!app) {
      message.reply('Command not working!')
    } else {
      (async () => {
        let localUserResponse
        try {
          localUserResponse = await app.service('users').find({
            query: {
              discordId: message.author.id
            }
          })
        } catch (error) {
          console.error(error)
          message.reply(error.message)
        }

        if (localUserResponse) {
          const localUser = localUserResponse.data[0]
          if (localUser) {
            const tournamentData = {}
            if (args[0]) tournamentData.title = args[0]
            else tournamentData.title = 'New tournament'
            if (args[1]) tournamentData.description = args[1]
            else tournamentData.description = 'Describe your tournament here.'
            if (args[2]) tournamentData.code = args[2]
            tournamentData.players = [localUser._id]

            tournamentData.games = [
              {
                home: {
                  user: localUser._id,
                  score: 'neni'
                },
                away: {
                  user: null,
                  score: null
                }
              }
            ]

            let tournament
            try {
              tournament = await app.service('tournaments').create(tournamentData)
            } catch (err) {
              console.error(err)
              message.reply(err.message)
            }

            if (tournament) {
              message.author.send(`New tournament was created, you can edit it on: http://localhost:8080/tournament/${tournament._id}`)
            }
          }
        }
      })()
    }
  }
}
