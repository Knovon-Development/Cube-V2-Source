// .env
require('dotenv').config()

// Express
const express = require('express')
const app = express()

// Routers
const homeRouter = require('./routes/home')
const hubsRouter = require('./routes/hubs')
const usersRouter = require('./routes/users')

// Middleware Modules
const corsGate = require('cors-gate')
const cors = require('cors')
const helmet = require('helmet')

// Files
const path = require('path')

// Database
const { db } = require('./util/database/firebase')

// Auth
const session = require('express-session')
const FirebaseStore = require('connect-session-firebase')(session)
const rateLimit = require('express-rate-limit')
// Util
const { clientLogger } = require('./util/logger')

// Static Files
app.use('/assets', express.static(path.join(__dirname, '/public')))

// EJS Setup
app.set('view engine', 'ejs')

// Create the rate limit rule
const apiRequestLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 40, // limit each IP to 2 requests per windowMs
  message: {status: false, error: "You've been ratelimited."}
})

// Use the limit rule as an application middleware
app.use(apiRequestLimiter)

// Helmet Setup
app.use(
  helmet({
    contentSecurityPolicy: false
  })
)

if (process.env.NODE_ENV === 'production') {
  // CORS
  app.use(corsGate.originFallbackToReferrer())

  app.use(
    cors({
      origin: [process.env.APP_URL],
      credentials: true
    })
  )

  app.use(
    corsGate({
      strict: true,
      allowSafe: true,
      origin: process.env.APP_URL,
      failure: (req, res, next) => {
        return res.status(403).json({
          success: false,
          errors: ['Not in CORS Whitelist']
        })
      }
    })
  )
}

// Middleware Use
app.use(
  session({
    store: new FirebaseStore({
      database: db.raw
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 365 * 1000
    }
  })
)

// Body Parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routers Setup
app.use('/', homeRouter)
app.use('/hubs', hubsRouter)
app.use('/users', usersRouter)

// 500 Handling
app.use((exErr, req, res, next) => {
  clientLogger.error(exErr)
  return res.status(500).send('500: Internal Server Error')
})

// 404 Handling
app.use((req, res) => {
  res.status(404).send('This is not the page you are looking for')
})

var http = require("http").Server(app);

http.listen(process.env.PORT || 80, () => {
  clientLogger.info(`Hub Listening on port: ${process.env.PORT || 80}`)
})
