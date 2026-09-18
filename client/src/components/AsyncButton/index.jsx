import { Box, Button, CircularProgress } from "@material-ui/core";
import React from "react";
import asyncButtonStyles from "./styles";

const AsyncButton = ({
  loading,
  variant = "outlined",
  color = "primary",
  handleClick,
  padding,
  children,
  ...rest
}) => {
  const classes = asyncButtonStyles();

  return (
    <Box className={classes.buttonContainer}>
      <Button
        color={color}
        variant={variant}
        onClick={handleClick}
        disabled={loading}
        className={classes.buttonItem}
        {...rest}
      >
        {children}
      </Button>
      {loading && (
        <CircularProgress size={24} className={classes.buttonProgress} />
      )}
    </Box>
  );
};

export default AsyncButton;
