import {createStore, combineReducers, applyMiddleware} from 'redux'
import {createLogger} from 'redux-logger'
import thunkMiddleware from 'redux-thunk'
import auth from './auth'
import access from './token'
import stockInfo from './stockInfo'

const reducer = combineReducers({ 
    auth, 
    access,
    stockInfo
})
const middleware = applyMiddleware(thunkMiddleware, createLogger({collapsed: true}))
const store = createStore(reducer, middleware)

export default store
export * from './auth'
export * from './token'
export * from './stockInfo'