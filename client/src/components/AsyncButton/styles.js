import { makeStyles } from "@material-ui/core/styles";
import { vaxxedTheme } from "../../styles/theme";

const asyncButtonStyles = makeStyles((muiTheme) => ({
  buttonContainer: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: ({ padding }) => `${padding}px 0`,
  },
  buttonProgress: {
    color: vaxxedTheme.palette.primary.main,
    position: "absolute",
  },
}));

export default asyncButtonStyles;
