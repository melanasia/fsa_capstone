import React, { useState, useEffect } from "react";
import axios from "axios";
import env from "../../env";
import Ticker from "react-ticker";

export default function StockTicker() {
  const [data, setData] = useState([]);
  const [tickerString, setTickerString] = useState("");

  const accessKey = env.accessKey;
  const ticker = ["SPY"]; //'^TNX']

  const fetchStock = () => {
    ticker.map(async (_ticker) => {
      const spyData = (
        await axios.get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${_ticker}&apikey=${accessKey}`
        )
      ).data;
      setData((data) => [
        ...data,
        {
          ticker: spyData["Global Quote"]["01. symbol"],
          closing: (spyData["Global Quote"]["08. previous close"] * 1).toFixed(
            2
          ),
        },
      ]);
    });
  };

  useEffect(() => {
    fetchStock();
  }, []);

  useEffect(() => {
    const dataString = data
      .map((_data) => {
        return `${_data.ticker}: ${_data.closing} `;
      })
      .join("   ");
    setTickerString(dataString);
  }, [data]);

  return (
    <div>
      {data.length === ticker.length ? (
        <Ticker style={{ width: 50 }} mode="smooth" offset="run-in" speed={10}>
          {({}) => (
            <>
              <p style={{ paddingRight: "0.5em" }}>{tickerString}</p>
            </>
          )}
        </Ticker>
      ) : null}
    </div>
  );
}
