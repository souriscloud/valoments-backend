const axios = require('axios').default
const axiosCookieJarSupport = require('axios-cookiejar-support').default
const tough = require('tough-cookie')

/* eslint-disable no-unused-vars */
exports.Valoleak = class Valoleak {
  constructor (options) {
    this.options = options || {};
  }

  async getValorantEloLastCommit () {
    const client = axios.create()
    const response = await client.get('https://api.github.com/repos/souriscloud/valorant-elo/commits?per_page=1&page=1', {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    })
    if (response.data.length !== 1) {
      return {
        error: 'Some error'
      }
    } else {
      const lastCommit = response.data[0]
      return lastCommit.commit
    }
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
      redirect_uri: 'https://playvalorant.com/opt_in',
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

  async getUserInfo (riotClient, accessToken, entitlementsToken, userId) {
    const response = await riotClient.put('https://pd.eu.a.pvp.net/name-service/v2/players', [userId], {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Riot-Entitlements-JWT': entitlementsToken
      }
    })
    
    return response.data[0]
  }

  async getCompetiveUpdates (riotClient, cookieJar, accessToken, count = 1) {
    const userId = await this.getUserId(riotClient, cookieJar, accessToken)
    const entitlementsToken = await this.getEntitlementsJWT(riotClient, cookieJar, accessToken)
    const startIndex = 0
    const endIndex = count

    const userInfo = await this.getUserInfo(riotClient, accessToken, entitlementsToken, userId)

    const response = await riotClient.get(`https://pd.eu.a.pvp.net/mmr/v1/players/${userId}/competitiveupdates?startIndex=${startIndex}&endIndex=${endIndex}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Riot-Entitlements-JWT': entitlementsToken
      }
    })
    
    return {
      userInfo,
      matches: response.data.Matches
    }
  }

  transformRiotMatch (match) {
    const move = match.CompetitiveMovement
    const promoted = move === 'PROMOTED'
    const demoted = move === 'DEMOTED'
    const rankChanged = promoted || demoted

    const m = {
      id: match.MatchID,
      map: this.translateRiotMap(match.MapID),
      startTime: match.MatchStartTime,
      move,
      promoted,
      demoted,
      rankChanged,
      tier: match.TierAfterUpdate,
      before: match.TierProgressBeforeUpdate,
      after: match.TierProgressAfterUpdate,
      ranked: !move.includes('UNKNOWN')
    }

    if (rankChanged) {
      if (promoted) {
        const gain = 100 - match.TierProgressBeforeUpdate + match.TierProgressAfterUpdate
        m.tierProgress = `+ ${gain}`
      }

      if (demoted) {
        const gain = 100 - match.TierProgressAfterUpdate + match.TierProgressBeforeUpdate
        m.tierProgress = `- ${gain}`
      }

      m.isUp = m.promoted
    } else {
      const progressChangeUp = match.TierProgressAfterUpdate > match.TierProgressBeforeUpdate
      const progressChangeNum = progressChangeUp ? match.TierProgressAfterUpdate - match.TierProgressBeforeUpdate : match.TierProgressBeforeUpdate - match.TierProgressAfterUpdate
      m.tierProgress = `${progressChangeUp ? '+' : '-'} ${progressChangeNum}`
      m.isUp = progressChangeUp
    }

    return m
  }

  transformRiotUserInfo (userInfo) {
    return {
      displayName: `${userInfo.GameName} #${userInfo.TagLine}`
    }
  }

  translateRiotMap (map) {
    const maps = {
      '/Game/Maps/Ascent/Ascent': 'Ascent',
      '/Game/Maps/Bonsai/Bonsai': 'Split',
      '/Game/Maps/Duality/Duality': 'Bind',
      '/Game/Maps/Port/Port': 'Icebox',
      '/Game/Maps/Triad/Triad': 'Haven'
    }

    
    if (maps[map]) {
      return maps[map]
    }

    return map
  }

  transformRiotResponse ({ userInfo, matches }) {
    let lastMatch = null
    for (const m of matches) {
      if (!m.CompetitiveMovement.includes('UNKNOWN')) {
        lastMatch = m
        break
      }
    }

    return {
      userInfo: this.transformRiotUserInfo(userInfo),
      matches: matches.map(match => this.transformRiotMatch(match)),
      noRanked: lastMatch === null,
      lastMatch
    }
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
      const count = data.count || 3
      const competUpdates = await this.getCompetiveUpdates(riotClient, cookieJar, data.accessToken, count)
      console.log(dtstr, 'COMPET', `${competUpdates.userInfo.GameName}#${competUpdates.userInfo.TagLine}`)
      return this.transformRiotResponse(competUpdates)
    }

    if (data.type && data.type === 'git-elo') {
      return this.getValorantEloLastCommit()
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
