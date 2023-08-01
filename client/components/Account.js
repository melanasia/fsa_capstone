import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import { Link } from "react-router-dom";
import { me } from "../store";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function Account({ username }) {
  
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [newPwState, setNewPwState] = useState(null);
  const [oldPwState, setOldPwState] = useState(null);
  const [confirmPwState, setConfirmPwState] = useState(null);
  
  // // Fetch balance data
  const onSubmit = useCallback(async () => {
    const data = {
      newPw : newPwState,
      oldPw : oldPwState,
      confirmPw : confirmPwState,
    };
    const authToken = window.localStorage.getItem('token')
    try
    {
      const response = await axios.post("/api/users/changepassword", data, {
        headers: {
          authorization: authToken
        }
      });
      const result = await response.data;
      alert("Password Changed");
      handleClose();
    }
    catch (err) {
      alert(err.response.data);
    }
  }, [newPwState, oldPwState, confirmPwState, handleClose]);
  
    return (
        <Box sx={{ marginTop: '20px' }}>
          <Button onClick={handleOpen}>Change Password</Button>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <h3>Change Password</h3>
              <TextField onChange={e => setOldPwState(e.target.value)} type="password" placeholder="Old Password"></TextField>
              <TextField onChange={e => setNewPwState(e.target.value)} type="password" placeholder="New Password"></TextField>
              <TextField onChange={e => setConfirmPwState(e.target.value)} type="password" placeholder="Confirm Password"></TextField>
              <Box>
                <Button onClick={onSubmit}>Submit</Button>
              </Box>
            </Box>
          </Modal>
        </Box>
    )
}

const mapState = state => {
  return {
    username: state.auth.username
  }
}

export default connect(mapState)(Account)
