import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { HomeLayoutContext } from "../../context/HomeLayoutContext";

const Header = () => {
  const { handleToggleSidebar } = React.useContext(HomeLayoutContext);
  return (
    <Box sx={{ width: "100%", position: "fixed", top: 0, zIndex: 1000 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={handleToggleSidebar}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Typography variant="h6" component="div">
              CHMSU
            </Typography>
            <Typography variant="h6" component="div">
              {import.meta.env.VITE_APP_NAME}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default React.memo(Header);
