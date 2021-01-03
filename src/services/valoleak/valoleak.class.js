const axios = require('axios').default
const axiosCookieJarSupport = require('axios-cookiejar-support').default
const tough = require('tough-cookie')

/* eslint-disable no-unused-vars */
exports.Valoleak = class Valoleak {
  constructor (options) {
    this.options = options || {};
  }

  async setupRiotClient () {
    const riotClient = axios.create({
      withCredentials: true
    })

    axiosCookieJarSupport(riotClient)
    const cookieJar = new tough.CookieJar()

    await riotClient.post('https://auth.riotgames.com/api/v1/authorization', {
      client_id: 'play-valorant-web-prod',
      nonce: 1,
      redirect_uri: 'https://beta.playvalorant.com/opt_in',
      response_type: 'token id_token',
      scope: 'account openid'
    }, {
      jar: cookieJar
    })

    return {
      riotClient,
      cookieJar
    }
  }

  async getToken (riotClient, cookieJar, credentials = { username: '', password: '' }) {
    const response = await riotClient.put('https://auth.riotgames.com/api/v1/authorization', {
      type: 'auth',
      username: credentials.username,
      password: credentials.password
    }, {
      jar: cookieJar
    })
  
    const accessTokenResponse = response.data.response.parameters.uri
    const responseParams = accessTokenResponse.replace('https://beta.playvalorant.com/opt_in#', '')
    const responseParsed = new URLSearchParams(responseParams)
    const accessToken = responseParsed.get('access_token')

    return accessToken
  }

  async getUserId (riotClient, cookieJar, accessToken) {
    const response = await riotClient.post('https://auth.riotgames.com/userinfo', {}, {
      headers: {'Authorization': `Bearer ${accessToken}`},
      jar: cookieJar
    })
  
    const userID = response.data.sub
    return userID
  }

  async getEntitlementsJWT (riotClient, cookieJar, accessToken) {
    const response = await riotClient.post('https://entitlements.auth.riotgames.com/api/token/v1', {}, {
      headers: {'Authorization': `Bearer ${accessToken}`},
      jar: cookieJar
    })
  
    const entitlementsToken = response.data.entitlements_token
    return entitlementsToken
  }

  async getCompetiveUpdates (riotClient, cookieJar, accessToken, count = 1) {
    const userId = await this.getUserId(riotClient, cookieJar, accessToken)
    const entitlementsToken = await this.getEntitlementsJWT(riotClient, cookieJar, accessToken)
    const startIndex = 0
    const endIndex = count

    const response = await riotClient.get(`https://pd.eu.a.pvp.net/mmr/v1/players/${userId}/competitiveupdates?startIndex=${startIndex}&endIndex=${endIndex}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Riot-Entitlements-JWT': entitlementsToken
      }
    })
    
    return response.data
  }

  async find (params) {
    return [];
  }

  async get (id, params) {
    return {}
  }

  async create (data, params) {
    const dtstr = new Intl.DateTimeFormat('cs', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date())
    if (data.type && data.type === 'riotauth') {
      const { riotClient, cookieJar } = await this.setupRiotClient()
      const accessToken = await this.getToken(riotClient, cookieJar, {
        username: data.username,
        password: data.password // Password as soon as retrieved is shipped to Riot, to minimalize vulnerabilities!
      })

      console.log(dtstr, 'RIOTAUTH', data.username)

      return {
        accessToken
      }
    }

    if (data.type && data.type === 'compet') {
      const { riotClient, cookieJar } = await this.setupRiotClient()
      console.log(dtstr, 'COMPET')
      return await this.getCompetiveUpdates(riotClient, cookieJar, data.accessToken, 3)
    }
    
    return {}
  }

  async update (id, data, params) {
    return data;
  }

  async patch (id, data, params) {
    return data;
  }

  async remove (id, params) {
    return { id };
  }
};
