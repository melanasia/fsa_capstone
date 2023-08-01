import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  Select,
} from "@mui/material";
import axios from "axios";

const Contribute = ({ goals, style }) => {
  const [open, setOpen] = useState(false);
  const [openSnack, setSnack] = useState(false);
  const [goalId, setGoalId] = useState("");
  const [applied, setApplied] = useState(0);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleCloseSnack = () => setSnack(false);

  const authToken = window.localStorage.getItem("token");

  const handleSubmit = async () => {
    await axios.put(
      `/api/goals/${goalId}`,
      {
        applied: applied,
      },
      {
        headers: {
          authorization: authToken,
        },
      }
    );
    handleClose();
    window.location.reload();
  };

  return (
    <Box>
      <Button onClick={handleOpen}>Contribute to goals</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} display="flex" flexDirection="column">
          <FormControl fullWidth>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Contribute to your goal:
            </Typography>
            <Select
              value={goalId}
              onChange={(ev) => setGoalId(ev.target.value)}
            >
              <MenuItem value="">Select a goal</MenuItem>
              {goals.map((goal) => {
                return (
                  !goal.reached && (
                    <MenuItem value={goal.id} key={goal.id}>
                      {goal.name}
                    </MenuItem>
                  )
                );
              })}
            </Select>
            <TextField
              label="amount to contribute"
              name="applied"
              type="number"
              onChange={(ev) => setApplied(ev.target.value)}
            ></TextField>
            <Button onClick={handleSubmit}>Make contribution</Button>
          </FormControl>
        </Box>
      </Modal>
    </Box>
  );
};

export default Contribute;
