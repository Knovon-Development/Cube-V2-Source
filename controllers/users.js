const { db } = require('../util/database/firebase')

const usersControllers = {
  endpointsMapping: async (req, res, next) => {
    return res.json({
      success: true,
      endpoints: [
        {
          path: '/users/discord/:discordUserId',
          info: 'Gets user information',
          method: 'GET',
          requiresAuthentication: false
        },
        {
          path: '/users/roblox/:robloxUserId',
          info: 'Gets user information',
          method: 'GET',
          requiresAuthentication: false
        }
      ]
    })
  },
  getDiscordUser: async (req, res, next) => {
    const { discordUserId } = req.params
    const user = await db.get(`users/${discordUserId}`)
    if (!user) {
      return res.status(404).json({
        success: false,
        errors: ['User is not our database']
      })
    }

    return res.json({
      success: true,
      data: user
    })
  },
  getRobloxUser: async (req, res, next) => {
    const { robloxUserId } = req.params
    const users = await db.get('users')

    const userRecord = Object.values(users).find(
      user => user.robloxId === robloxUserId
    )

    if (!userRecord) {
      return res.status(404).json({
        success: false,
        errors: ['User is not our database']
      })
    } else {
      return res.json({
        success: true,
        data: userRecord
      })
    }
  }
}

module.exports = usersControllers
