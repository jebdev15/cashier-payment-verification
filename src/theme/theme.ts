import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#047940",
      light: "#35a468",
      dark: "#133f35",
      contrastText: "#fff",
    },
    secondary: {
      main: "#f47e3a",
      light: "#ff9b67",
      dark: "#c05410",
      contrastText: "#000",
    },
    error: {
      main: "#ed1c24",
      light: "#ff5449",
      dark: "#b30000",
      contrastText: "#fff",
    },
    warning: {
      main: "#f0df10",
      light: "#fff44f",
      dark: "#baad00",
      contrastText: "#000",
    },
    info: {
      main: "#044f7c",
      light: "#3578aa",
      dark: "#002950",
      contrastText: "#fff",
    },
    grey: {
      500: "#939598",
    },
  },
});
