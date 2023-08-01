import React, { useEffect, useState } from "react";
import axios from "axios";
import DenseTable from "./DenseTable";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";

export default function Cash() {
  const [data, setData] = useState([null]);
  const [loading, setLoading] = useState(true);

  // // Fetch balance data
  const getBalance = React.useCallback(async () => {
    setLoading(true);
    const response = await axios.get("/plaid/api/balance", {});
    const data = await response.data;
    setData(data);
    setLoading(false);
    console.log(data);
  }, [setData, setLoading]);

  useEffect(async () => {
    await getBalance();
  }, []);

  return (
    <div>
      {!loading && data != null && (
        <div>
          <Accordion sx={{ maxWidth: 700 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Cash</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <DenseTable
                sizing={{ maxWidth: 650 }}
                accounts={[
                  {
                    name: data.accounts[0].name,
                    balances: data.accounts[0].balances.current,
                  },
                  {
                    name: data.accounts[1].name,
                    balances: data.accounts[1].balances.current,
                  },
                ]}
              />
            </AccordionDetails>
          </Accordion>
        </div>
      )}
    </div>
  );
}
