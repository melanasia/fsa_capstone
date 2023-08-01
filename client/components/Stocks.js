import React, { useState, useEffect } from "react";
import axios from "axios";
import env from "../../env";
import LineChart from "./InvestmentChart";
import InvestmentsTable from "./InvestementsTable";
import { Box } from "@mui/material";

export default function Stocks() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState({});

  const accessKey = env.accessKey;

  const getInvestmentHoldings = React.useCallback(async () => {
    const authToken = window.localStorage.getItem("token");
    setLoading(true);
    const response = await axios.get("/plaid/api/holdings", {
      headers: {
        authorization: authToken,
      },
    });
    const data = await response.data
      .filter((_data) => _data.type === "equity" || _data.type === "etf")
      .map((_data) => _data.ticker_symbol);

    setData(data);
    setLoading(false);
  }, [setData, setLoading]);

  const getClosing = async (data) => {
    let arr = [];

    for (const el of data) {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${el}&apikey=${accessKey}`
      );
      const dates = response.data;

      if (dates["Meta Data"]) {
        arr.push({
          ticker: dates["Meta Data"]["2. Symbol"],
          data: dates["Time Series (Daily)"],
        });
      }
    }
    return arr;
  };

  useEffect(async () => {
    await getInvestmentHoldings();
  }, [setData, setLoading]);

  useEffect(async () => {
    const compiledData = await getClosing(data);
    if (compiledData.length) {
      const parsedData = parseData(compiledData);
      setClosing(parsedData);
    }
  }, [data]);

  const parseData = (data) => {
    const today = Date.now();
    const endDate = today - 30 * 24 * 60 * 60 * 1000; // 30 days ago
    const output = { categories: [], values: [] };

    for (const el of data) {
      const valueObject = {
        name: el.ticker,
        data: [],
      };
      for (const date in el.data) {
        const dateObject = Date.parse(date);
        if (dateObject >= endDate) {
          output.categories.unshift(date);
          if (el.data[date]) {
            valueObject.data.unshift(
              (el.data[date]["4. close"] * 1).toFixed(2)
            );
          }
        }
      }
      output.values.push(valueObject);
    }
    return output;
  };

  return (
    <Box>
      {!loading && Object.keys(closing).length !== 0 && (
        <Box display="flex" justifyContent='center'>
          <Box padding='1rem'>
            <LineChart dataArr={closing} />
          </Box>
          <Box padding='1rem'>
            <InvestmentsTable dataArr={closing} />
          </Box>
        </Box>
      )}
    </Box>
  );
}
