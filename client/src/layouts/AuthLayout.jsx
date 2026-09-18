import { Backdrop, Box, CircularProgress } from "@material-ui/core";
import React from "react";
import AuthLayoutStyles from "./AuthLayout.style.js";

const AuthLayout = ({ children }) => {
  const classes = AuthLayoutStyles();

  return (
    <div className={classes.appRoot}>
      <Box className={classes.appContainer}>{children}</Box>
    </div>
  );
};

export default AuthLayout;
