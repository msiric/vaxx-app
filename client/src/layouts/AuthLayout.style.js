import { makeStyles } from "@material-ui/core/styles";

const AuthLayoutStyles = makeStyles((muiTheme) => ({
  appRoot: {
    display: "flex",
    flexFlow: "column",
    minHeight: "100vh",
    height: "100%",
    justifyContent: "space-between",
  },
  appBackdrop: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
    zIndex: muiTheme.zIndex.drawer + 1,
    color: "#fff",
    background: "#fff",
  },
  appContainer: {
    width: "100%",
  },
}));

export default AuthLayoutStyles;
