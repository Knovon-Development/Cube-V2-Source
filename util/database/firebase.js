const credential = require('./firebase.json')
const Database = require('quick-firebase')

const db = new Database(process.env.DATABASE_URL, credential)

module.exports = { db }
