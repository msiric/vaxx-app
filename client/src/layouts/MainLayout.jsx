import { Backdrop, Box, CircularProgress } from "@material-ui/core";
import React from "react";
import MainLayoutStyles from "./MainLayout.style.js";

const MainLayout = ({ children }) => {
  const classes = MainLayoutStyles();

  return (
    <div className={classes.appRoot}>
      <Box className={classes.appContainer}>{children}</Box>
    </div>
  );
};

export default MainLayout;
