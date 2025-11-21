import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { AdminLayoutContext } from "../../context/AdminLayoutContext";
import { Divider, useMediaQuery } from "@mui/material";
import { theme } from "@/theme/theme";

const Header = () => {
  const { handleToggleSidebar } = React.useContext(AdminLayoutContext);
  const isMobileSize = useMediaQuery("(max-width: 768px)");
  return (
    <AppBar
      position="fixed"
      sx={{
        borderRadius: 4,
        inset: "0.5rem",
        bottom: "unset",
        width: "auto",
        backgroundColor: `color-mix(in srgb, ${theme.palette.primary.main} 75%, transparent)`,
        backdropFilter: "blur(0.5rem)",
        boxShadow: 2,
      }}
      className="no-print"
    >
      <Toolbar>
        <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 1 }} onClick={handleToggleSidebar}>
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: "flex", flexDirection: { isMobile: "row", md: "row" }, width: "100%" }}>
          <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
            <img src="/optimizedLogo.png" alt="logo" style={{ width: 50, height: 50, marginRight: 5 }} />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <Typography variant={isMobileSize ? "h6" : "h5"} sx={{ mb: -1, textTransform: "uppercase", fontSize: "1.5rem" }} component="div">
              {isMobileSize ? "CHMSU" : "Carlos Hilado Memorial State University"}
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, display: isMobileSize ? "block" : "none" }} />
            <Typography variant={isMobileSize ? "body1" : "h6"} sx={{ fontSize: "1rem", opacity: 0.8, letterSpacing: 0 }} component="div">
              {isMobileSize ? "CPVERIS" : import.meta.env.VITE_APP_NAME}
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default React.memo(Header);
