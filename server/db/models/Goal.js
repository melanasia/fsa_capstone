const db = require('../db')
const { STRING, INTEGER, BOOLEAN, DATEONLY } = require('sequelize');


const Goal = db.define('goal', {
    name: {
        type: STRING, 
        allowNull: false
    }, 
    target: {
        type: INTEGER,
        allowNull: false
    },
    dueDate: {
        type: DATEONLY,
        allowNull: false
    },
    reached: {
        type: BOOLEAN, 
        defaultValue: false
    }
})

module.exports = Goal
