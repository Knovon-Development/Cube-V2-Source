const { db } = require('../util/database/firebase')
const { sendProduct } = require('../util/products')

const hubsControllers = {
  status: async (req, res, next) => {
    return res.json({
      success: true,
      message: 'Hubs are up and running'
    })
  },
  endpointsMapping: async (req, res, next) => {
    return res.json({
      success: true,
      endpoints: [
        {
          path: '/hubs/:hubId?apiKey=apiKey',
          info: 'Gets the hub information',
          method: 'GET',
          requiresAuthentication: true
        },
        {
          path: '/hubs/:hubId/products?apiKey=apiKey',
          info: 'Gets the hub products',
          method: 'GET',
          requiresAuthentication: true
        },
        {
          path: '/hubs/:hubId/products/owners?apiKey=apiKey',
          info: 'Gives a license of the product to someone',
          method: 'POST',
          body: {
            productId: 'Product ID',
            deliveryType:
              '1 - Purchased from the hub | 2 - Given by an admin or transfered from another user | 3 - Retrieved with command | Note: Delivery Type only affects the message sent to the user'
          },
          requiresAuthentication: true
        },
        {
          path: '/hubs/:hubId/products/owners/:productId/:userId',
          info: 'Checks if an user has the product',
          method: 'GET',
          requiresAuthentication: false
        }
      ]
    })
  },
  getHub: async (req, res, next) => {
    const { hubId } = req.params
    const hub = await db.get(`hubs/${hubId}`)
    if (!hub) {
      return res.status(404).json({
        success: false,
        errors: ["Hub doesn't exist"]
      })
    }

    if (hub.credentials.api !== req.query.apiKey) {
      return res.status(401).json({
        success: false,
        errors: ['Invalid API Key']
      })
    }

    delete hub.credentials
    return res.json({
      success: true,
      data: hub
    })
  },
  getHubProducts: async (req, res, next) => {
    const { hubId } = req.params
    const hub = await db.get(`hubs/${hubId}`)
    if (!hub) {
      return res.status(404).json({
        success: false,
        errors: ["Hub doesn't exist"]
      })
    }

    if (hub.credentials.api !== req.query.apiKey) {
      return res.status(401).json({
        success: false,
        errors: ['Invalid API Key']
      })
    }

    const products = await db.get(`hubs/${hubId}/products`)
    if (!products) {
      return res.status(404).json({
        success: false,
        errors: ['Hub has no products']
      })
    }

    return res.json({
      success: true,
      data: products
    })
  },
  giveProduct: async (req, res, next) => {
    const { hubId } = req.params
    const hub = await db.get(`hubs/${hubId}`)
    if (!hub) {
      return res.status(404).json({
        success: false,
        errors: ["Hub doesn't exist"]
      })
    }

    if (hub.credentials.api !== req.query.apiKey) {
      return res.status(401).json({
        success: false,
        errors: ['Invalid API Key']
      })
    }
console.log(req.body)
    const products = await db.get(`hubs/${hubId}/products`)
	console.log(products)
	let productExists = false
    products.forEach(function (product) {
    	if (req.body.productId == product.id) {
		productExists = true
    	}
   })

   if (productExists == false) {
      return res.status(404).json({
        success: false,
        errors: ["Product doesn't exist"]
      })
    }

    const user = await db.get(`users/${req.body.userId}/robloxId`)
    if (!user) {
      return res.status(404).json({
        success: false,
        errors: ["User doesn't has a ROBLOX Account Linked"]
      })
    }

    const userProducts = await db.get(`users/${req.body.userId}/ownedProducts`)
    if (userProducts) {
      if (userProducts.includes(req.body.productId)) {
        return res.status(400).json({
          success: false,
          errors: ['User already owns the product']
        })
      }
    }

    const deliveryType = req.body.deliveryType || 1
    await db.push(`users/${req.body.userId}/ownedProducts`, req.body.productId)

    /*if (deliveryType !== 1 || deliveryType !== 2 || deliveryType !== 3) {
      return res.status(400).json({
        success: false,
        errors: ['Invalid delivery type, it must be 1, 2 or 3']
      })
    }*/

    await sendProduct(req.body.productId, req.body.userId, 1)

    return res.json({
      success: true,
      productId: req.body.productId
    })
  },
  checkProduct: async (req, res, next) => {
    const { hubId } = req.params
    const hub = await db.get(`hubs/${hubId}`)
    if (!hub) {
      return res.status(404).json({
        success: false,
        errors: ["Hub doesn't exist"]
      })
    }

    const userProducts = await db.get(
      `users/${req.params.userId}/ownedProducts`
    )

    if (!Array.isArray(userProducts)) {
      return res.json({
        success: true,
        hasProductOwnership: false
      })
    }

    if (!(await db.has(`products/${req.params.productId}`))) {
      return res.json({
        success: true,
        hasProductOwnership: false
      })
    }

    if (!userProducts.includes(req.params.productId)) {
      return res.json({
        success: true,
        hasProductOwnership: false
      })
    }

    return res.json({
      success: true,
      hasProductOwnership: true
    })
  }
}

module.exports = hubsControllers
