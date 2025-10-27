import React from "react";
import { Box } from "@mui/material";
import { Outlet, useNavigate } from "react-router";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import CustomCircularProgress from "@/components/CustomCircularProgress";

type JWTDecodeDataType = {
  isAuthenticated: boolean | number;
  isStudent: boolean | number;
  isAdministrator: boolean | number;
};
const Layout = () => {
  const [{ accessToken }] = useCookies(["accessToken"]);
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState<boolean>(true);
  const checkSession = () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (!accessToken) return navigate("/admin/sign-in", { replace: true });
        const { isAuthenticated, isStudent, isAdministrator }: JWTDecodeDataType = jwtDecode(accessToken);
        if (!isAuthenticated) return navigate("/admin/sign-in", { replace: true });
        if (!isAdministrator) return navigate("/admin/sign-in", { replace: true });
        if (isStudent) return navigate("/admin/sign-in", { replace: true });
        resolve(setLoading(false));
      }, 1000);
    });
  };
  React.useEffect(() => {
    const verifySession = async () => {
      await checkSession();
    };
    verifySession();
  }, [accessToken]);
  if (loading) return <CustomCircularProgress />;
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100dvh",
        width: "100%",
        backgroundColor: "#f0f0f0",
      }}
    >
      <Header />
      <Box sx={{ display: "flex", pt: { xs: "64px", sm: "72px" }, height: "100%", flex: 1 }}>
        <Sidebar />
        <Box sx={{ flex: 1, padding: 2 }}>
          {/* <Box sx={{ bgcolor: "background.paper", borderRadius: 4, boxShadow: 2, px: { xs: 2, md: 3 }, py: 2, minHeight: "100%" }}> */}
          <Outlet />
          {/* </Box> */}
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(Layout);
