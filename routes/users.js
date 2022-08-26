const express = require('express')
const usersControllers = require('../controllers/users')
const users = express.Router()

users.get('/', usersControllers.endpointsMapping)
users.get('/discord/:discordUserId', usersControllers.getDiscordUser)
users.get('/roblox/:robloxUserId', usersControllers.getRobloxUser)

module.exports = users
