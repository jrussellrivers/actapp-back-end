const {connect} = require('./config')
const pgp = require('pg-promise')()
const db = pgp(connect)
module.exports = db