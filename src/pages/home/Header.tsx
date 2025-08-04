import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { HomeLayoutContext } from "../../context/HomeLayoutContext";
import { Divider, useMediaQuery } from "@mui/material";

const Header = () => {
  const { handleToggleSidebar } = React.useContext(HomeLayoutContext);
  const isMobileSize = useMediaQuery("(max-width: 768px)");
  return (
    <Box sx={{ width: "100%", position: "fixed", top: 0, zIndex: 1000 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={handleToggleSidebar}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", flexDirection: { isMobile: "row", md: "column" }, width: "100%" }}>
            <Typography variant={isMobileSize ? "h6" : "h5"} component="div">
              {isMobileSize ? "CHMSU" : "Carlos Hilado Memorial State University"}
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, display: isMobileSize ? "block" : "none" }} />
            <Typography variant={isMobileSize ? "body1" : "h6"} component="div">
              {isMobileSize ? "CPVERIS" : import.meta.env.VITE_APP_NAME}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default React.memo(Header);
