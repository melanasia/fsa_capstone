import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Button, Modal, TextField } from "@mui/material";
import axios from "axios";
import Contribute from "./GoalContribution";
import DeleteIcon from "@mui/icons-material/Delete";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const Goals = (props) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [name, setName] = useState("");
  const [target, setTarget] = useState(0);
  const [budget, setBudget] = useState(0);
  const [budgetAmt, setBudgetAmt] = useState(0);

  const [date, setDate] = useState("");

  const authToken = window.localStorage.getItem("token");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  const getGoals = async () => {
    const goalsArr = (
      await axios.get("/api/goals", {
        headers: {
          authorization: authToken,
        },
      })
    ).data;
    setGoals(goalsArr);
  };

  const onSubmit = async () => {
    await axios.post(
      "/api/goals",
      {
        name: name,
        dueDate: date,
        target: target,
      },
      {
        headers: {
          authorization: authToken,
        },
      }
    );
    handleClose();
    getGoals();
  };

  const getBudget = async () => {
    let budgetAmt = (
      await axios.get("/api/budget", {
        headers: {
          authorization: authToken,
        },
      })
    ).data;
    setBudgetAmt(budgetAmt[0].amount);
  };
  const onSubmitBudget = async () => {
    await axios.post(
      "/api/budget",
      {
        amount: budget,
      },
      {
        headers: {
          authorization: authToken,
        },
      }
    );
    handleClose();
    getBudget();
  };

  const deleteGoal = async (goal) => {
    await axios.delete(`/api/goals/${goal.id}`);
    getGoals();
  };

  useEffect(async () => {
    await getGoals();
    await getBudget();
  }, []);

  return (
    <Box sx={{ marginTop: "20px" }}>
      <Box display='flex'>
        {budgetAmt === 0 ?  (
          <Box display='flex' alignItems='flex-end' >
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Set your budget here: 
            </Typography>
            <TextField
              label="budget"
              name="amount"
              onChange={(ev) => setBudget(ev.target.value)}
              margin='dense'
              size="small"
            ></TextField>
            <Button onClick={onSubmitBudget}>Create budget</Button>
          </Box>
        ) : (
          `Your budget is $${budgetAmt}` 
        ) 
        }
      </Box>
      <Box>
        <Button onClick={handleOpen}>Create a goal</Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style} display="flex" flexDirection="column">
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Set your goal here:
            </Typography>
            <TextField
              label="name"
              name="name"
              onChange={(ev) => setName(ev.target.value)}
            ></TextField>
            <TextField
              name="dueDate"
              type="date"
              onChange={(ev) => setDate(ev.target.value)}
            ></TextField>
            <TextField
              label="target amount"
              name="target"
              type="number"
              onChange={(ev) => setTarget(ev.target.value)}
            ></TextField>
            <Button onClick={onSubmit}>Create goal</Button>
          </Box>
        </Modal>
      </Box>
      <Contribute goals={goals} style={style} />
      <Box>
        {goals.map((goal) => {
          return (
            <li key={goal.id}>
              {goal.name} (by: {goal.dueDate}): ${goal.target}
              {goal.reached && " - Goal reached"}
              <Button onClick={() => deleteGoal(goal)}>
                <DeleteIcon />
              </Button>
            </li>
          ); 
        })}
      </Box>
    </Box>

    // <Box sx={{ bgcolor: 'background.paper', width: 500 }}>
    //   <AppBar position="static">
    //     <Tabs
    //       value={value}
    //       onChange={handleChange}
    //       indicatorColor="secondary"
    //       textColor="inherit"
    //       variant="fullWidth"
    //       aria-label="full width tabs example"
    //     >
    //       <Tab label="Budget" id={0} />
    //       <Tab label="Financial" id={1} />
    //     </Tabs>
    //   </AppBar>
    //     <TabPanel value={value} index={0} dir={theme.direction}>
    //       Item One
    //     </TabPanel>
    //     <TabPanel value={value} index={1} dir={theme.direction}>
    //       Item Two
    //     </TabPanel>
    //     <TabPanel value={value} index={2} dir={theme.direction}>
    //       Item Three
    //     </TabPanel>
    // </Box>
  );
};

const mapState = (state) => {
  return {};
};

const mapDispatch = (dispatch) => {
  return {
    createGoal: () => dispatch(createGoal()),
  };
};

export default connect(mapState, mapDispatch)(Goals);
