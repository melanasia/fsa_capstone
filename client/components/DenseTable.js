import React from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Paper,
  Typography,
} from "@mui/material";

export default function DenseTable({ accounts, sizing }) {
  return (
    <Paper sx={sizing}>
      <TableContainer>
        <Table sx={sizing} size="small" aria-label="a dense table">
          <TableBody>
            {accounts.map((account) => {
              return (
                <TableRow key={account.name}>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>${Math.round(account.balances)}</TableCell>
                </TableRow>
              );
            })}
            {/* <TableRow>
            <TableCell>
              
            </TableCell>
            <TableCell>{balances}</TableCell>
          </TableRow> */}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
