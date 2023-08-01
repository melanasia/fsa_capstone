const router = require('express').Router()


const {
  models: { User }
} = require('../db')

const { isLoggedIn } = require('../middleware')

module.exports = router
const session = require('express-session')

// read env vars from .env file
require('dotenv').config()
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid')
const util = require('util')
// const express = require('express')
// const app = express()
const moment = require('moment')
const { default: axios } = require('axios')
const { cp } = require('fs')

//const APP_PORT = process.env.APP_PORT || 8000
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID
const PLAID_SECRET = process.env.PLAID_SECRET
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox'
const SESSION_SECRET = process.env.SESSION_SECRET

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || 'transactions').split(',')

// PLAID_COUNTRY_CODES is a comma-separated list of countries for which users
// will be able to select institutions from.
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(',')

// Parameters used for the OAuth redirect Link flow.
//
// Set PLAID_REDIRECT_URI to 'http://localhost:3000'
// The OAuth redirect flow requires an endpoint on the developer's website
// that the bank website should redirect to. You will need to configure
// this redirect URI for your client ID through the Plaid developer dashboard
// at https://dashboard.plaid.com/team/api.
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || ''

// We store the access_token in memory - in production, store it in a secure
// persistent data store
let ACCESS_TOKEN = null
let PUBLIC_TOKEN = null
let ITEM_ID = null

// The transfer_id is only relevant for Transfer ACH product.
// We store the transfer_id in memory - in production, store it in a secure
// persistent data store
let TRANSFER_ID = null

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
      'Plaid-Version': '2020-09-14'
    }
  }
})

const client = new PlaidApi(configuration)

// router.post('/api/info', function (request, response, next) {
//   response.json({
//     item_id: ITEM_ID,
//     access_token: ACCESS_TOKEN,
//     products: PLAID_PRODUCTS
//   })
// })

//Creates a Link token and return it
router.get('/api/create_link_token', isLoggedIn, async (req, res, next) => {
  try {
    const user = req.user

    const tokenResponse = await client.linkTokenCreate({
      user: { client_user_id: `${user.id}` },
      client_name: "Plaid's Tiny Quickstart",
      language: 'en',
      products: ['auth', 'transactions', 'investments', 'liabilities'],
      country_codes: ['US'],
      redirect_uri: 'https://localhost:8080/plaid/callback'
    })
    
    return res.send(tokenResponse.data)
    // res.send('hello')
  } catch (ex) {
    next(ex)
  }
})

router.get('/api/access_token', isLoggedIn, async(req, res, next) => {
  res.send(req.user.accessToken)
})

router.use('/callback', (req ,res) => {
  res.send('hello')
})

router.use(
  // FOR DEMO PURPOSES ONLY
  // Use an actual secret key in production
  session({ secret: SESSION_SECRET, saveUninitialized: true, resave: true })
)

// // Exchanges the public token from Plaid Link for an access token
router.post('/api/exchange_public_token', async (req, res, next) => {
  try {

    const user = await User.findByToken(req.body.headers.authorization)

    const exchangeResponse = await client.itemPublicTokenExchange({
      public_token: req.body.body.public_token
    })
    await user.updateAccessToken(exchangeResponse.data.access_token)
    // FOR DEMO PURPOSES ONLY
    // Store access_token in DB instead of session storage

    req.session.access_token = exchangeResponse.data.access_token
    ///another change just pushings sake
    //currently it is running the updateAccessToken from the prototype object with User.prototype, 
      //but we neeed a way to pass the user's username or some other unique identifier
      
    // const token = exchangeResponse.data.access_token
    // await User.updateAccessToken(token)
    //   .then(()=> console.log('it saved!'))


    //req.session.public_token = req.body.body.public_token
    // async function saveToken(){
    //   const token = req.session.access_token
    //   const response = axios.post('/savetoken', token)
    // }
    return res.json(true)
    // stop further execution in this callback
  } catch (ex) {
    next(ex)
  }
})

// // Fetches balance data using the Node client library for Plaid
router.get('/api/balance', isLoggedIn, async (req, res, next) => {

  const access_token = req.user.accessToken

  const balanceResponse = await client.accountsBalanceGet({ access_token })
  return res.send(balanceResponse.data)
  // return res.json({
  //   Balance: balanceResponse.data
  // })
})

// // Retrieve Transactions for an Item
// // https://plaid.com/docs/#transactions
router.get('/api/transactions', isLoggedIn, function (request, response, next) {
  const ACCESS_TOKEN = request.user.accessToken
  
  Promise.resolve()
    .then(async function () {
      // Set cursor to empty to receive all historical updates
      let cursor = null

      // New transaction updates since "cursor"
      let added = []
      let modified = []
      // Removed transaction ids
      let removed = []
      let hasMore = true
      // Iterate through each page of new transaction updates for item
      while (hasMore) {
        const request = {
          access_token: ACCESS_TOKEN,
          cursor: cursor
        }
        const response = await client.transactionsSync(request)
        const data = response.data

        //
        //console.log(data)
        // Add this page of results
        added = added.concat(data.added)
        modified = modified.concat(data.modified)
        removed = removed.concat(data.removed)
        hasMore = data.has_more
        // Update cursor to the next cursor
        cursor = data.next_cursor
        // prettyPrintResponse(response)
      }

      const compareTxnsByDateAscending = (a, b) =>
        (a.date > b.date) - (a.date < b.date)
      // Return the 8 most recent transactions
      const recently_added = [...added]
        .sort(compareTxnsByDateAscending)
        .slice(-8)

        response.send(recently_added)
    })
    .catch(next)
})

const prettyPrintResponse = response => {
  console.log(util.inspect(response.data, { colors: true, depth: 4 }))
}

// Retrieve Holdings for an Item
// https://plaid.com/docs/#investments
router.get('/api/holdings', isLoggedIn, function (request, response, next) {
  const ACCESS_TOKEN = request.user.accessToken
  Promise.resolve()
    .then(async function () {
      const holdingsResponse = await client.investmentsHoldingsGet({
        access_token: ACCESS_TOKEN
      })
      // prettyPrintResponse(holdingsResponse)
      response.send(holdingsResponse.data.securities)
      // response.json({ error: null, holdings: holdingsResponse.data })
    })
    .catch(next)
})

// Retrieve Liabilities for an Item
// https://plaid.com/docs/#liabilities
router.get('/api/liabilities', isLoggedIn, function (request, response, next) {
  const ACCESS_TOKEN = request.user.accessToken
  Promise.resolve()
    .then(async function () {
      const liabilitiesResponse = await client.liabilitiesGet({
        access_token: ACCESS_TOKEN
      })
      prettyPrintResponse(liabilitiesResponse)
      response.json({ error: null, liabilities: liabilitiesResponse.data })
    })
    .catch(next)
})

// //TO-DO: This endpoint will be deprecated in the near future
// router.get('/api/payroll_income', function (request, response, next) {
//   const ACCESS_TOKEN = request.session.access_token
//   Promise.resolve()
//     .then(async function () {
//       const paystubsGetResponse = await client.creditPayrollIncomeGet({
//         access_token: ACCESS_TOKEN
//       })
//       prettyPrintResponse(paystubsGetResponse)
//       response.json({ error: null, paystubs: paystubsGetResponse.data })
//     })
//     .catch(next)
// })

// // Exchange token flow - exchange a Link public_token for
// // an API access_token
// // https://plaid.com/docs/#exchange-token-flow
// router.post('/api/set_access_token', function (request, response, next) {
//   PUBLIC_TOKEN = request.body.public_token
//   Promise.resolve()
//     .then(async function () {
//       const tokenResponse = await client.itemPublicTokenExchange({
//         public_token: PUBLIC_TOKEN
//       })
//       prettyPrintResponse(tokenResponse)
//       ACCESS_TOKEN = tokenResponse.data.access_token
//       ITEM_ID = tokenResponse.data.item_id
//       if (PLAID_PRODUCTS.includes('transfer')) {
//         TRANSFER_ID = await authorizeAndCreateTransfer(ACCESS_TOKEN)
//       }
//       response.json({
//         access_token: ACCESS_TOKEN,
//         item_id: ITEM_ID,
//         error: null
//       })
//     })
//     .catch(next)
// })

// // // Retrieve Investment Transactions for an Item
// // // https://plaid.com/docs/#investments
// router.get('/api/investments_transactions', function (request, response, next) {
//   const ACCESS_TOKEN = request.session.access_token

//   Promise.resolve()
//     .then(async function () {
//       const startDate = moment()
//         .subtract(30, 'days')
//         .format('YYYY-MM-DD')
//       const endDate = moment().format('YYYY-MM-DD')
//       const configs = {
//         access_token: ACCESS_TOKEN,
//         start_date: startDate,
//         end_date: endDate
//       }
//       const investmentTransactionsResponse = await client.investmentsTransactionsGet(
//         configs
//       )
//       prettyPrintResponse(investmentTransactionsResponse)
//       response.json({
//         error: null,
//         investments_transactions: investmentTransactionsResponse.data
//       })
//     })
//     .catch(next)
// })

// // Retrieve ACH or ETF Auth data for an Item's accounts
// // https://plaid.com/docs/#auth
// router.get('/api/auth', function (request, response, next) {
//   Promise.resolve()
//     .then(async function () {
//       const authResponse = await client.authGet({
//         access_token: ACCESS_TOKEN
//       })
//       prettyPrintResponse(authResponse)
//       response.json(authResponse.data)
//     })
//     .catch(next)
// })

// // Retrieve Identity for an Item
// // https://plaid.com/docs/#identity
// router.get('/api/identity', function (request, response, next) {
//   Promise.resolve()
//     .then(async function () {
//       const identityResponse = await client.identityGet({
//         access_token: ACCESS_TOKEN
//       })
//       prettyPrintResponse(identityResponse)
//       response.json({ identity: identityResponse.data.accounts })
//     })
//     .catch(next)
// })

// // Retrieve real-time Balances for each of an Item's accounts
// // https://plaid.com/docs/#balance
// router.get('/api/balance', function (request, response, next) {
//   Promise.resolve()
//     .then(async function () {
//       const balanceResponse = await client.accountsBalanceGet({
//         access_token: ACCESS_TOKEN
//       })
//       prettyPrintResponse(balanceResponse)
//       response.json(balanceResponse.data)
//     })
//     .catch(next)
// })

// // Retrieve information about an Item
// // https://plaid.com/docs/#retrieve-item
// router.get('/api/item', function (request, response, next) {
//   Promise.resolve()
//     .then(async function () {
//       // Pull the Item - this includes information about available products,
//       // billed products, webhook information, and more.
//       const itemResponse = await client.itemGet({
//         access_token: ACCESS_TOKEN
//       })
//       // Also pull information about the institution
//       const configs = {
//         institution_id: itemResponse.data.item.institution_id,
//         country_codes: ['US']
//       }
//       const instResponse = await client.institutionsGetById(configs)
//       prettyPrintResponse(itemResponse)
//       response.json({
//         item: itemResponse.data.item,
//         institution: instResponse.data.institution
//       })
//     })
//     .catch(next)
// })

// // Retrieve an Item's accounts
// // https://plaid.com/docs/#accounts
// router.get('/api/accounts', function (request, response, next) {
//   Promise.resolve()
//     .then(async function () {
//       const accountsResponse = await client.accountsGet({
//         access_token: ACCESS_TOKEN
//       })
//       prettyPrintResponse(accountsResponse)
//       response.json(accountsResponse.data)
//     })
//     .catch(next)
// })

// // Create and then retrieve an Asset Report for one or more Items. Note that an
// // Asset Report can contain up to 100 items, but for simplicity we're only
// // including one Item here.
// // https://plaid.com/docs/#assets
// router.get('/api/assets', function (request, response, next) {
//   Promise.resolve()
//     .then(async function () {
//       // You can specify up to two years of transaction history for an Asset
//       // Report.
//       const daysRequested = 10

//       // The `options` object allows you to specify a webhook for Asset Report
//       // generation, as well as information that you want included in the Asset
//       // Report. All fields are optional.
//       const options = {
//         client_report_id: 'Custom Report ID #123',
//         // webhook: 'https://your-domain.tld/plaid-webhook',
//         user: {
//           client_user_id: 'Custom User ID #456',
//           first_name: 'Alice',
//           middle_name: 'Bobcat',
//           last_name: 'Cranberry',
//           ssn: '123-45-6789',
//           phone_number: '555-123-4567',
//           email: 'alice@example.com'
//         }
//       }
//       const configs = {
//         access_tokens: [ACCESS_TOKEN],
//         days_requested: daysRequested,
//         options
//       }
//       const assetReportCreateResponse = await client.assetReportCreate(configs)
//       prettyPrintResponse(assetReportCreateResponse)
//       const assetReportToken = assetReportCreateResponse.data.asset_report_token
//       const getResponse = await getAssetReportWithRetries(
//         client,
//         assetReportToken
//       )
//       const pdfRequest = {
//         asset_report_token: assetReportToken
//       }

//       const pdfResponse = await client.assetReportPdfGet(pdfRequest, {
//         responseType: 'arraybuffer'
//       })
//       prettyPrintResponse(getResponse)
//       prettyPrintResponse(pdfResponse)
//       response.json({
//         json: getResponse.data.report,
//         pdf: pdfResponse.data.toString('base64')
//       })
//     })
//     .catch(next)
// })

// router.get('/api/transfer', function (request, response, next) {
//   Promise.resolve()
//     .then(async function () {
//       const transferGetResponse = await client.transferGet({
//         transfer_id: TRANSFER_ID
//       })
//       prettyPrintResponse(transferGetResponse)
//       response.json({
//         error: null,
//         transfer: transferGetResponse.data.transfer
//       })
//     })
//     .catch(next)
// })

// router.use('/api', function (error, request, response, next) {
//   prettyPrintResponse(error.response)
//   response.json(formatError(error.response))
// })

// // const server = router.listen(APP_PORT, function () {
// //   console.log('plaid-quickstart server listening on port ' + APP_PORT)
// // })

// // This is a helper function to poll for the completion of an Asset Report and
// // then send it in the response to the client. Alternatively, you can provide a
// // webhook in the `options` object in your `/asset_report/create` request to be
// // notified when the Asset Report is finished being generated.

// const getAssetReportWithRetries = (
//   plaidClient,
//   asset_report_token,
//   ms = 1000,
//   retriesLeft = 20
// ) =>
//   new Promise((resolve, reject) => {
//     const request = {
//       asset_report_token
//     }

//     plaidClient
//       .assetReportGet(request)
//       .then(resolve)
//       .catch(() => {
//         setTimeout(() => {
//           if (retriesLeft === 1) {
//             reject('Ran out of retries while polling for asset report')
//             return
//           }
//           getAssetReportWithRetries(
//             plaidClient,
//             asset_report_token,
//             ms,
//             retriesLeft - 1
//           ).then(resolve)
//         }, ms)
//       })
//   })

// const formatError = error => {
//   return {
//     error: { ...error.data, status_code: error.status }
//   }
// }

// // This is a helper function to authorize and create a Transfer after successful
// // exchange of a public_token for an access_token. The TRANSFER_ID is then used
// // to obtain the data about that particular Transfer.

// const authorizeAndCreateTransfer = async accessToken => {
//   // We call /accounts/get to obtain first account_id - in production,
//   // account_id's should be persisted in a data store and retrieved
//   // from there.
//   const accountsResponse = await client.accountsGet({
//     access_token: accessToken
//   })
//   const accountId = accountsResponse.data.accounts[0].account_id

//   const transferAuthorizationResponse = await client.transferAuthorizationCreate(
//     {
//       access_token: accessToken,
//       account_id: accountId,
//       type: 'credit',
//       network: 'ach',
//       amount: '1.34',
//       ach_class: 'ppd',
//       user: {
//         legal_name: 'FirstName LastName',
//         email_address: 'foobar@email.com',
//         address: {
//           street: '123 Main St.',
//           city: 'San Francisco',
//           region: 'CA',
//           postal_code: '94053',
//           country: 'US'
//         }
//       }
//     }
//   )
//   prettyPrintResponse(transferAuthorizationResponse)
//   const authorizationId = transferAuthorizationResponse.data.authorization.id

//   const transferResponse = await client.transferCreate({
//     idempotency_key: '1223abc456xyz7890001',
//     access_token: accessToken,
//     account_id: accountId,
//     authorization_id: authorizationId,
//     type: 'credit',
//     network: 'ach',
//     amount: '12.34',
//     description: 'Payment',
//     ach_class: 'ppd',
//     user: {
//       legal_name: 'FirstName LastName',
//       email_address: 'foobar@email.com',
//       address: {
//         street: '123 Main St.',
//         city: 'San Francisco',
//         region: 'CA',
//         postal_code: '94053',
//         country: 'US'
//       }
//     }
//   })
//   prettyPrintResponse(transferResponse)
//   return transferResponse.data.transfer.id
// }
