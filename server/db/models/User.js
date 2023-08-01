const Sequelize = require('sequelize')
const db = require('../db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const axios = require('axios');
const { STRING } = require('sequelize');

const SALT_ROUNDS = 5;

const User = db.define('user', {
  username: {
    type: STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: STRING,
  },
  accessToken: {
    type:  STRING, 
    allowNull: true
  }
})

module.exports = User

/**
 * instanceMethods
 */
User.prototype.correctPassword = function(candidatePwd) {
  //we need to compare the plain version to an encrypted version of the password
  return bcrypt.compare(candidatePwd, this.password);
}

User.prototype.generateToken = function() {
  return jwt.sign({id: this.id}, process.env.JWT)
}

//user.updateToken - would update the token for the specific user
User.prototype.updateAccessToken = async function (token) {
  const user = await User.findOne(
    {
      where: {
        id: this.id
      }
    }
  )
  await user.update({ accessToken: token})
  return user
}
/**
 * classMethods
 */
User.authenticate = async function({ username, password }){
    const user = await this.findOne({where: { username }})
    if (!user || !(await user.correctPassword(password))) {
      const error = Error('Incorrect username/password');
      error.status = 401;
      throw error;
    }
    return user.generateToken();
};

User.findByToken = async function(token) {
  try {

    const {id} = await jwt.verify(token, process.env.JWT)
    const user = User.findByPk(id)
    if (!user) {
      throw 'nooo'
    }
    return user
  } catch (ex) {
    const error = Error('bad token')
    error.status = 401
    throw error
  }
}

User.changePassword = async function(token, body) {
  // pull user from database
  const user = await User.findByToken(token)
  const { oldPw, newPw, confirmPw } = body
  
  // compare old password to database
  if(!(await user.correctPassword(oldPw))) {
    const error = Error('Old password does not match');
    error.status = 401
    throw error
  }
  
  // compare new password with confirm
  if(newPw !== confirmPw) {
    const error = Error('Passwords do not match');
    error.status = 401
    throw error
  }
  
  // update database
  await user.update({ 
    password: newPw
  })
  
  // return confirmation or errors
  return true;
}

/**
 * hooks
 */
const hashPassword = async(user) => {
  //in case the password has been changed, we want to encrypt it with bcrypt
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
  }
}

User.beforeCreate(hashPassword)
User.beforeUpdate(hashPassword)
User.beforeBulkCreate(users => Promise.all(users.map(hashPassword)))
