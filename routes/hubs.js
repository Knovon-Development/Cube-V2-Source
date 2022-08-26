const express = require('express')
const hubsControllers = require('../controllers/hubs')
const hubs = express.Router()

hubs.get('/', hubsControllers.endpointsMapping)
hubs.get('/:hubId', hubsControllers.getHub)
hubs.get('/:hubId/products', hubsControllers.getHubProducts)
hubs.post('/:hubId/products/owners', hubsControllers.giveProduct)
hubs.get('/:hubId/ownership/:productId/:userId', hubsControllers.checkProduct)

module.exports = hubs
