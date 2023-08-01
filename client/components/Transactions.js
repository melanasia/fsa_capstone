import { useState, useEffect } from 'react';
import * as React from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import moment from 'moment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import SpendingChart from './SpendingChart';


export default function Transactions() {
  return (
   <div>
    <SpendingChart />
     <BasicTable />
   </div>
  )
 }
 
 
function allCategories(transactions) {
    if (transactions === null) {
        return [];
    }
    console.log([...new Set(transactions.map((txn) => txn.category[0]))]);
    return [...new Set(transactions.map((txn) => txn.category[0]))];
}

function BasicTable() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const getTransactions = React.useCallback(async () => {
    const authToken = window.localStorage.getItem('token')
    const response = await axios.get('/plaid/api/transactions', {
        headers: {
        authorization: authToken
      }
    })
    const data = await response.data
    setData(data)
    setLoading(false)
   }, [setData, setLoading]);
   const [category, setCategory] = React.useState('');

  useEffect(async ()=> {
    await getTransactions()
    let transactions = data
    console.log(transactions)
  }, [])
  
  const handleChange = (event) => {
    setCategory(event.target.value);
  };

 return (

    <div>
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Category</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={category}
              label="Category"
              onChange={handleChange}
            >
            <MenuItem value={''}>All</MenuItem>
            {
              allCategories(data).map((cat) => <MenuItem value={cat}>{cat}</MenuItem>)
            }
            </Select>
          </FormControl>
        </Box>
      {
         !loading && data != null ?
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Transactions</TableCell>
          <TableCell align="right">Date</TableCell>
          <TableCell align="right">Channel</TableCell>
          <TableCell align="right">Category</TableCell>
        </TableRow>
        </TableHead>
        <TableBody>
          {console.log(data)}
          {data.map((row) => {
            let date = moment(row.date).format('ll');
            if (category !== '' && row.category[0] !== category) {
                return;
            }
           return (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
            <TableCell> {row.name} </TableCell>
            <TableCell component="th" scope="row">
              ${row.amount}
            </TableCell>
            <TableCell align="right">{date}</TableCell>
            <TableCell align="right">{row.payment_channel === 'other' ? 'Credit card payment' : row.payment_channel}</TableCell>
            <TableCell align="right">{row.category[0]}</TableCell>
            </TableRow>
           )
          })}
        </TableBody>
      </Table>
      </TableContainer>
        :
        null
          }
      </div>
    );
}