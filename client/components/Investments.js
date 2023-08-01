import React, { useState, useEffect } from 'react'
import {connect} from 'react-redux'
import { getAccess } from '../store';
import Stocks from './Stocks'


const Investments = props => {
  const { getAccess, accessToken } = props;
  
  const authToken = window.localStorage.getItem("token");

  // await getAccess(authToken)
  useEffect(async () => {
    if(accessToken === '')
      await getAccess(authToken);
  }, []);

  return (
    <div>
      <h3>Investments</h3>
      <Stocks />
    </div>
  )
}

const mapState = (state) => {
  return {
    accessToken: state.access
  };
};

const mapDispatch = (dispatch) => {
  return {
    getAccess: (authToken) => dispatch(getAccess(authToken))
  };
};

export default connect(mapState, mapDispatch)(Investments)
