import React, { useEffect, useState } from 'react'
import axios from 'axios'
import DenseTable from './DenseTable'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material'

export default function Credit () {
  const [data, setData] = useState([null])
  const [loading, setLoading] = useState(true)

  // // Fetch balance data
  const getBalance = React.useCallback(async () => {
    setLoading(true)
    const authToken = window.localStorage.getItem('token')

    const response = await axios.get('/plaid/api/balance', {
      headers: {
        authorization: authToken
      }
    })
    const data = await response.data
    setData(data)
    setLoading(false)
  }, [setData, setLoading])

  useEffect(async () => {
    await getBalance()
  }, [])

  const cashAccts = !loading &&
    data != null && [
      {
        name: data.accounts[0].name,
        balances: data.accounts[0].balances.current
      },
      {
        name: data.accounts[1].name,
        balances: data.accounts[1].balances.current
      }
    ]
  const creditAccts = !loading &&
    data != null && [
      {
        name: data.accounts[3].name,
        balances: -data.accounts[3].balances.current
      }
    ]
  const investmentAccts = !loading &&
    data != null && [
      {
        name: data.accounts[2].name,
        balances: data.accounts[2].balances.current
      },
      {
        name: data.accounts[4].name,
        balances: data.accounts[4].balances.current
      },
      {
        name: data.accounts[5].name,
        balances: data.accounts[5].balances.current
      },
      {
        name: data.accounts[6].name,
        balances: data.accounts[6].balances.current
      }
    ]
  const propertyAccts = !loading &&
    data != null && [
      {
        name: data.accounts[8].name,
        balances: data.accounts[8].balances.current
      }
    ]
  const loanAccts = !loading &&
    data != null && [
      {
        name: data.accounts[7].name,
        balances: -data.accounts[7].balances.current
      }
    ]

  return (
    <>
      <BalanceCard
        name='Cash'
        loading={loading}
        data={data}
        accts={cashAccts}
      />
      <BalanceCard
        name='Credit Card'
        loading={loading}
        data={data}
        accts={creditAccts}
      />
      <BalanceCard
        name='Investments'
        loading={loading}
        data={data}
        accts={investmentAccts}
      />
      <BalanceCard
        name='Property'
        loading={loading}
        data={data}
        accts={propertyAccts}
      />
      <BalanceCard
        name='Loans'
        loading={loading}
        data={data}
        accts={loanAccts}
      />
    </>
  )
}

export function BalanceCard ({ name, data, loading, accts }) {
  return (
    <div>
      {!loading && data != null && (
        <div>
          <Accordion sx={{ maxWidth: 700 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls='panel1a-content'
              id='panel1a-header'
            >
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <Typography>{name}</Typography>
                <Typography>
                  $
                  {Math.round(
                    accts.reduce((prev, curr) => prev + curr.balances, 0)
                  )}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <DenseTable sizing={{ maxWidth: 650 }} accounts={accts} />
            </AccordionDetails>
          </Accordion>
        </div>
      )}
    </div>
  )
}
