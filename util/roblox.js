const noblox = require('noblox.js')

const robloxClient = noblox.setCookie(process.env.ROBLOX_COOKIE)

module.exports = { robloxClient }
