import React from "react";
import { Box } from "@mui/material";
import { Outlet, useNavigate } from "react-router";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
const Layout = () => {
  const navigate = useNavigate();
  const [{ accessToken }] = useCookies(["accessToken"]);
  const [loading, setLoading] = React.useState<boolean>(true);
  React.useEffect(() => {
    const checkSession = () => {
      if (!accessToken) return navigate("/", { replace: true });
      const { isAuthenticated }: { isAuthenticated: boolean | number } = jwtDecode(accessToken);
      console.log({ isAuthenticated });
      if (!isAuthenticated) return navigate("/", { replace: true });
      setLoading(false);
    };
    checkSession();
  }, [accessToken]);

  return (
    !loading && (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          width: "100%",
          backgroundColor: "#f0f0f0",
          overflow: "hidden",
        }}
      >
        <Header />
        <Box sx={{ display: "flex", pt: "64px", height: "100%", flex: 1 }}>
          <Sidebar />
          <Box sx={{ flex: 1, padding: 2, overflow: "auto" }}>
            <Box sx={{ bgcolor: "background.paper", borderRadius: 4, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)", padding: 4, minHeight: "100%" }}>
              <Outlet />
            </Box>
          </Box>
        </Box>
      </Box>
    )
  );
};

export default React.memo(Layout);
