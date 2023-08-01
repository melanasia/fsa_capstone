//this is the access point for all things database related!

const db = require('./db')

const User = require('./models/User')
const Goal = require('./models/Goal')
const Budget = require('./models/Budget')

//associations could go here!

Goal.belongsTo(User)
Budget.belongsTo(User)

module.exports = {
  db,
  models: {
    User,
    Goal,
    Budget
  },
}
