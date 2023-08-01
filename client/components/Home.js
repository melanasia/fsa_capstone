import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import StockTicker from './StockTicker'
import Plaid from './Plaid'
import Balance from './Balance'
import { getAccess } from '../store'
import SpendingChart from './SpendingChart'
import { Box } from '@mui/material'
import NetWorth from './NetWorth'

/**
 * COMPONENT
 */

const levels = [
  { amount: 1000000 },
  { amount: 750000 },
  { amount: 500000 },
  { amount: 250000 },
  { amount: 100000 },
  { amount: 50000 },
  { amount: 30000 },
  { amount: 20000 },
  { amount: 10000 }
]

const netWorth = 59103 // sum of all values

// Create our number formatter.
var formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  maximumFractionDigits: 0 // (causes 2500.99 to be printed as $2,501)
})

function Home (props) {
  const { username, getAccess, accessToken } = props

  const authToken = window.localStorage.getItem('token')

  // await getAccess(authToken)
  useEffect(async () => {
    if (accessToken === '') await getAccess(authToken)
  }, [])

  return (
    <div>
      <StockTicker />
      <h3>Welcome, {username}</h3>

      {accessToken === '' ? (
        <div>
          <Plaid />
        </div>
      ) : (
        <div id='chartComponents'>
          <Box display='flex' flexDirection='column' width='50%'>
            <Balance />
          </Box>
          <Box>
            <h5> Net Worth: {formatter.format(netWorth)}</h5>
            {levels.map((item, idx) => (
              <NetWorth
                key={idx}
                completed={
                  item.amount > netWorth
                    ? parseFloat((netWorth / item.amount) * 100).toFixed(0)
                    : 100
                }
                amount={formatter.format(item.amount)}
              />
            ))}
          </Box>
        </div>
      )}
    </div>
  )
}

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    username: state.auth.username,
    accessToken: state.access
  }
}

const mapDispatch = dispatch => {
  return {
    getAccess: authToken => dispatch(getAccess(authToken))
  }
}

export default connect(mapState, mapDispatch)(Home)
