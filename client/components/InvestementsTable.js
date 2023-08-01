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
import {
    BsFillArrowUpRightCircleFill
} from 'react-icons/bs'
import {
    BsFillArrowDownRightSquareFill
} from 'react-icons/bs'

export default function InvestementsTable({ dataArr }) {

    const [data, setData] = useState([null]);
    const [loading, setLoading] = useState([null]);
    const [closing, setClosing] = useState([null]);
    const [holdings, setHoldings] = useState([null])
    const accessKey = 'MGTZ0YSNHUZU9933';

    //get the investements
    const getInvestmentHoldings = React.useCallback(async () => {
      const authToken = window.localStorage.getItem("token");
      setLoading(true);
      const response = await axios.get("/plaid/api/holdings", {
        headers: {
          authorization: authToken,
        },
      });

      const holdings = response.data.filter((_data) => _data.type === "equity" || _data.type === "etf")
      setHoldings(holdings)
      //set the holdings
      const data = await response.data
        .filter((_data) => _data.type === "equity" || _data.type === "etf")
        .map((_data) => _data.ticker_symbol);
      //set the data
      setData(data);
      setLoading(false);
    }, [setData, setLoading, setHoldings]);

  
    useEffect(async () => {
      await getInvestmentHoldings();
    }, [setData, setLoading, setHoldings]);

    function mapThroughData(data, ticker){
        let tickerData
        for (let key in data){
            if (key === 'values'){
                let values = data[key]
                values.map(value => value.name === ticker ? 
                    tickerData = value.data.pop() 
                : null)
            }
        }
       return tickerData !== undefined ? tickerData : 'No data found'
    }
    function price30DaysAgo(data, ticker){
        let tickerData
        for (let key in data){
            if (key === 'values'){
                let values = data[key]
                values.map(value => value.name === ticker ? 
                    tickerData = value.data.shift() 
                : null)
            }
        }
       return tickerData !== undefined ? tickerData : 'No data found'
    }


    function getDiffBetween30Days(data, ticker){
        let firstDate
        let lastDate
        for (let key in data){
           if (key === 'values'){
            let values = data[key]
            values.map(value => value.name === ticker ? 
                firstDate = value.data.pop()
             : null) 
           }
        }

        for (let key in data){
            if (key === 'values'){
             let values = data[key]
             values.map(value => value.name === ticker ? 
                 lastDate = value.data.shift()
             : null) 
            }
         }
         let diff = lastDate - firstDate
         let final = (diff/firstDate).toString().slice(0, 4)
            if (final > 0){
                return (
                    <div>
                        <BsFillArrowUpRightCircleFill /> {final  * 100}%
                    </div>
                )
            } else {
                return (
                    <div>
                        <BsFillArrowDownRightSquareFill /> {final}%
                    </div>
                )
            }
    }
  return (

        <div>
            {
            !loading && data != null ?
        
            <TableContainer component={Paper}>
            <Table sx={{ minWidth: 550 }} aria-label="simple table">
                <TableHead>
                <TableRow>
                    <TableCell><strong> Ticker </strong></TableCell>
                    <TableCell align="right">
                        <strong>  Current Price </strong>
                    </TableCell>
                    <TableCell align="right">
                        <strong> Price 30 days ago </strong>
                    </TableCell>
                    <TableCell align="right">
                        <strong> Change over 30 Days </strong>
                    </TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                    {holdings.map((row) => {
                      return (
                        <TableRow
                                key={row.ticker_symbol}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                            <TableCell component="th" scope="row">
                                {row.ticker_symbol}
                            </TableCell>
                            <TableCell align="right">
                                ${price30DaysAgo(dataArr, row.ticker_symbol)}
                            </TableCell>
                            <TableCell align="right">
                                ${mapThroughData(dataArr, row.ticker_symbol)}
                            </TableCell>
                            <TableCell align="right">
                                ${getDiffBetween30Days(dataArr,row.ticker_symbol)}
                            </TableCell>
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
