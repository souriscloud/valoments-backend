const axios = require('axios')
const { OAuthStrategy } = require('@feathersjs/authentication-oauth')

class DiscordStrategy extends OAuthStrategy {
  // async getProfile (authResult) {
  //   const accessToken = authResult.access_token
  //   const userOptions = {
  //     method: 'GET',
  //     headers: {'Authorization': `Bearer ${accessToken}`},
  //     url: `https://discord.com/api/users/@me`
  //   }

  //   const { data } = await axios(userOptions)

  //   return data
  // }

  async getEntityQuery (profile) {
    return {
      discordId: profile.id
    }
  }

  async getEntityData (profile) {
    const baseData = await super.getEntityData(profile)

    if (profile.avatar == null) {
      profile.avatar = 'https://cdn.discordapp.com/embed/avatars/0.png'
    } else {
      const isGif = profile.avatar.startsWith('a_')
      profile.avatar = `https://cdn.discordapp.com/avatars/${profile['id']}/${profile['avatar']}.${isGif ? 'gif' : 'png'}`
    }

    return {
      ...baseData,
      discordUsername: profile.username,
      discordId: profile.id,
      email: profile.email,
      avatar: profile.avatar
    }
  }
}

module.exports = {
  DiscordStrategy
}
