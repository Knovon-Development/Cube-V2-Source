const { Permissions } = require('discord.js')
const { dClient } = require('..')
const { db } = require('./database/firebase')

const getGuilds = userGuilds => {
  const rawGuilds = userGuilds.filter(guild => {
    return checkPermission(guild.permissions, Permissions.FLAGS.MANAGE_GUILD)
  })

  // Only return guilds that the bot is in
  const filteredGuilds = rawGuilds.filter(guild => {
    return dClient.guilds.cache.has(guild.id)
  })

  const finalGuilds = filteredGuilds.map(async guild => {
    guild.data = await db.get(`hubs/${guild.id}`)
    return guild
  })

  return Promise.all(finalGuilds)

  return finalGuilds
}

const checkPermission = (permission, flag) => {
  return (permission & 32) === 32
}

module.exports = { getGuilds, checkPermission }
