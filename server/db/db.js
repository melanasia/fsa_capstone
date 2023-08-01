const Sequelize = require('sequelize')
const pkg = require('../../package.json')
const databaseName = pkg.name

const config = {
  logging: false
}

if (process.env.LOGGING === 'true') {
  delete config.logging
}

//https://stackoverflow.com/questions/61254851/heroku-postgres-sequelize-no-pg-hba-conf-entry-for-host
if (process.env.DATABASE_URL) {
  config.dialectOptions = {
    ssl: {
      rejectUnauthorized: false
    }
  }
}
console.log(config, databaseName)
const db = new Sequelize(
  process.env.DATABASE_URL || 'postgres://localhost:5433/fs-capstone',
  config
)

module.exports = db
