const express = require('express')
const homeControllers = require('../controllers/home')
const home = express.Router()

home.get('/', homeControllers.index)

module.exports = home
