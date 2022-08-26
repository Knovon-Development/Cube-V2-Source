const { db } = require('./database/firebase')

const checkHubSetup = async hubId => {
  const hub = await db.has(`hubs/${hubId}`)
  return hub
}

const checkCustomBotSetup = async (type, id) => {
  if (type === 'guild') {
  const bots = await db.get(`servers`)
const theBot = bots?.filter((bot) => bot.guild === id );
if (!bots) return false
if (theBot.length > 0) return true
if (theBot.length <= 0) return false
  } else if (type === 'user') {
    const bots = await db.get(`users/${id}/servers`)
    if (!bots) return false
    if (bots.length > 2) return true
    if (bots.length <= 2) return false
  }
}

module.exports = { checkHubSetup, checkCustomBotSetup }
