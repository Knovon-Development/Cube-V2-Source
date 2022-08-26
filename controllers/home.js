const homeControllers = {
  index: async (req, res, next) => {
    res.json({
      success: true,
      baseEndpoints: [
        {
          path: '/hubs',
          info:
            'Information related to hubs, visit /hubs for endpoints documentation'
        },
        {
          path: '/users',
          info:
            'Information related to users, visit /users for endpoints documentation'
        }
      ]
    })
  }
}

module.exports = homeControllers
