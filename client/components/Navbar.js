import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { logout, removeAccess } from "../store";
import { Box, AppBar, Button, Typography } from "@mui/material";
import Avatar from "./Avatar";


const Navbar = ({ handleClick, isLoggedIn }) => (
  <div>
    <AppBar position="static">
      <nav>
        {isLoggedIn ? (
          <Box>
            {/* The navbar will show these links after you log in */}
            <Box display="flex" justifyContent="space-between">
              <Box display="flex" alignItems="center" paddingLeft="1rem">
                <Typography
                  display="flex"
                  component="h2"
                  variant="h4"
                  textTransform="uppercase"
                  alignItems="center"
                >
                  Upwards
                </Typography>
              </Box>
              <Box sx={{ display : 'flex', alignItems : "center" }}>
                <Avatar></Avatar>
                <Button>
                  <Link to="/home">Home</Link>
                </Button>
                <Button>
                  <Link to="/goals">Goals</Link>
                </Button>
                <Button>
                  <Link to="/investments">Investments</Link>
                </Button>
                <Button>
                  <Link to="/transactions">Transactions</Link>
                </Button>
                <Button>
                  <a href="#" onClick={handleClick}>
                    Logout
                  </a>
                </Button>
              </Box>
            </Box>
          </Box>
        ) : (
          <div>
            {/* The navbar will show these links before you log in */}
            <Box display="flex" justifyContent="space-between">
              <Box display="flex" alignItems="center" paddingLeft="1rem">
                <Typography
                  display="flex"
                  component="h2"
                  variant="h4"
                  textTransform="uppercase"
                  alignItems="center"
                >
                  Upwards
                </Typography>
              </Box>
              <Box>
                <Button>
                  <Link to="/login">Login</Link>
                </Button>
                <Button>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </Box>
            </Box>
          </div>
        )}
      </nav>
    </AppBar>
    {/* <hr /> */}
  </div>
);

/**
 * CONTAINER
 */
const mapState = (state) => {
  return {
    isLoggedIn: !!state.auth.id,
  };
};

const mapDispatch = (dispatch) => {
  return {
    handleClick() {
      dispatch(removeAccess())
      dispatch(logout());
    },
  };
};

export default connect(mapState, mapDispatch)(Navbar);
