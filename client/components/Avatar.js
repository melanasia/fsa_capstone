import * as React from 'react';
import MuiAvatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { deepPurple } from '@mui/material/colors';
import {connect} from 'react-redux';
import { Link } from "react-router-dom";

function Avatar({ username }) {
  return <Link to="/account">
    <MuiAvatar sx={{ bgcolor: deepPurple[500] }}>
    { username[0].toUpperCase() }
    </MuiAvatar>
  </Link>;
}

const mapState = state => {
  return {
    username: state.auth.username
  }
}

export default connect(mapState)(Avatar)
