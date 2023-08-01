const db = require('../db')
const { INTEGER } = require('sequelize');


const Budget = db.define('budget', {
    amount: {
        type: INTEGER,
        allowNull: false
    }
})

module.exports = Budget
