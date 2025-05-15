import React from "react";
import { RouterProvider } from "react-router";
import { routes } from "./router/routes";
import { CssBaseline } from "@mui/material";
import { CookiesProvider } from "react-cookie";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <React.Fragment>
        <CssBaseline />
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <CookiesProvider>
            <RouterProvider router={routes} />
          </CookiesProvider>
        </GoogleOAuthProvider>
      </React.Fragment>
    </ThemeProvider>
  );
}

export default App;
