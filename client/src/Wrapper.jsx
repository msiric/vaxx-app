import React, { createRef } from "react";
import Router from "./Router";
import { IconButton } from "@material-ui/core";
import {
  CheckCircleRounded as SuccessIcon,
  CloseRounded as CloseIcon,
  ErrorRounded as ErrorIcon,
  InfoRounded as InfoIcon,
  WarningRounded as WarningIcon,
} from "@material-ui/icons";
import { SnackbarProvider } from "notistack";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import { vaxxedTheme } from "./styles/theme";
import Interceptor from "./Interceptor";

const useStyles = makeStyles((muiTheme) => ({
  notificationContainer: {
    backgroundColor: `${vaxxedTheme.palette.primary.main} !important`,
    border: `1px solid ${vaxxedTheme.palette.border.main}`,
  },
  alert: {
    backgroundColor: "red !important",
  },
}));

const Wrapper = () => {
  const classes = useStyles();

  const notistackRef = createRef();

  const handleAlertClose = (key) => () => {
    notistackRef.current.closeSnackbar(key);
  };

  return (
    <ThemeProvider
      theme={{
        ...vaxxedTheme,
        palette: { ...vaxxedTheme.palette },
      }}
    >
      <SnackbarProvider
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        classes={{
          variantSuccess: classes.notificationContainer,
          variantError: classes.notificationContainer,
        }}
        dense
        maxSnack={1}
        preventDuplicate
        ref={notistackRef}
        autoHideDuration={2500}
        hideIconVariant
        action={(key) => (
          <IconButton
            color="inherit"
            aria-label="Close"
            className={classes.close}
            onClick={handleAlertClose(key)}
          >
            <CloseIcon />
          </IconButton>
        )}
      >
        <Interceptor />
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default Wrapper;
