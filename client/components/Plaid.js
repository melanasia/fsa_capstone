import axios from 'axios'
import React, { useState, useEffect, useCallback } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import Balance from './Balance'
import { Card } from '@mui/material'

function Plaid (props) {
  const [token, setToken] = useState(window.localStorage.getItem('link_token') || null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const onSuccess = useCallback(async publicToken => {
    setLoading(true)
    const authToken = window.localStorage.getItem('token')

    await axios.post('/plaid/api/exchange_public_token', {
      headers: {
        'Content-Type': 'application/json',
        authorization: authToken
      },
      body: { public_token: publicToken }
    })
    
    setLoading(false)
    window.location.reload()
    // await getBalance()
    // await getTransactions()
    // await getInvestmentTransactions()
    // await getInvestmentHoldings() //Investments.js
    // await getLiabilities()
  }, [])

  // Creates a Link token
  const createLinkToken = React.useCallback(async () => {
    // For OAuth, use previously generated Link token
    if (window.localStorage.getItem('link_token')) {
      const linkToken = window.localStorage.getItem('link_token')
      setToken(linkToken)
    } else {
      const authToken = window.localStorage.getItem('token')

      const response = await axios.get('/plaid/api/create_link_token', {
        headers: {
          authorization: authToken
        }
      })
      const data = await response.data
      setToken(data.link_token)
      localStorage.setItem('link_token', data.link_token)
    }
  }, [setToken])

  // // Fetch balance data
  const getBalance = React.useCallback(async () => {
    setLoading(true)
    const response = await axios.get('/plaid/api/balance', {})
    const data = await response.data
    setData(data)
    setLoading(false)
  }, [setData, setLoading])

  // Fetch transactions
  const getTransactions = React.useCallback(async () => {
    setLoading(true)
    const response = await axios.get('/plaid/api/transactions', {})
    const data = await response.data
    setData(data)
    setLoading(false)
  }, [setData, setLoading])

  // Fetch investments transactions
  const getInvestmentTransactions = React.useCallback(async () => {
    setLoading(true)
    const response = await axios.get('/plaid/api/investments_transactions', {})
    const data = await response.data
    setData(data)
    setLoading(false)
  }, [setData, setLoading])

  // Fetch investments transactions
  const getInvestmentHoldings = React.useCallback(async () => {
    setLoading(true)
    const response = await axios.get('/plaid/api/holdings', {})
    const data = await response.data
    setData(data)
    setLoading(false)
  }, [setData, setLoading])

  // Fetch investments transactions
  const getLiabilities = React.useCallback(async () => {
    setLoading(true)
    const response = await axios.get('/plaid/api/liabilities', {})
    const data = await response.data
    setData(data)
    setLoading(false)
  }, [setData, setLoading])

  // Fetch income paystubs
  const getIncome = React.useCallback(async () => {
    setLoading(true)
    const response = await axios.get('/plaid/api/payroll_income', {})
    const data = await response.data
    setData(data)
    setLoading(false)
  }, [setData, setLoading])

  let isOauth = false

  const config = {
    token,
    onSuccess
  }

  // // For OAuth, configure the received redirect URI
  if (window.location.href.includes('?oauth_state_id=')) {
    config.receivedRedirectUri = window.location.href
    isOauth = true
  }
  const { open, ready } = usePlaidLink(config)

  useEffect(() => {
    if (token == null) {
      createLinkToken()
    }
    if (isOauth && ready) {
      open()
    }
  }, [])

  return (
    <div>
     { loading && <button onClick={() => open()} disabled={!ready}>
        <strong>Link account</strong>
      </button>
     } 

      {/* { 
        !loading && 
        <Balance/>
      } */}
      {/* {!loading &&
        data != null && <Cash /> &&
        Object.entries(data).map((entry, i) => (
          <pre key={i}>
            <code>{JSON.stringify(entry[1], null, 2)}</code>
          </pre>
        ))} */}
    </div>
  )
}

export default Plaid
