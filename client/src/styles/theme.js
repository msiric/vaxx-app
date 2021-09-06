import { createMuiTheme } from "@material-ui/core/styles";

export const vaxxedTheme = createMuiTheme({
  typography: {
    fontFamily: [
      "Poppins",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Oxygen-Sans",
      "Ubuntu",
      "Cantarell",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
    fontSize: 14,
  },
  palette: {
    type: "light",
    primary: { main: "#1E2B37", alt: "#9BCECB" },
    secondary: { main: "#04b9a7", alt: "#304de6" },
    success: { main: "#7ad624", alt: "#08333B" },
    info: { main: "#247ad6", alt: "#F0F2F2" },
    warning: { main: "#d3d624", alt: "#F79A3E" },
    error: { main: "#d62724", alt: "#F4C0BD" },
    muted: { main: "#e9ebed", alt: "#c2c8cc" },
    light: { main: "#f8f9f9", alt: "#d8dcde" },
    dark: { main: "#2e3942", alt: "#87929e" },
    border: {
      main: "#545454",
    },
    background: {
      alert: "#424242",
    },
  },
  padding: {
    container: 24,
  },
  margin: {
    element: 2,
    container: "12px auto",
  },
  props: {
    MuiButton: {
      variant: "contained",
      color: "primary",
    },
    MuiPaper: {
      elevation: 9,
    },
    MuiCard: {
      elevation: 6,
    },
  },
});

vaxxedTheme.overrides.MuiPickersCalendarHeader = {
  iconButton: {
    backgroundColor: "transparent",
  },
};
