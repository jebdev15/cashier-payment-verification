import React from "react";
import { AccountCircle, ExitToApp as ExitToAppIcon } from "@mui/icons-material";
import { Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { sideNav } from "./sideNav";
import { useCookies } from "react-cookie";
import { HomeLayoutContext } from "../../context/HomeLayoutContext";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
  const { sidebarOpen } = React.useContext(HomeLayoutContext);
  const navigate = useNavigate();
  const [{ accessToken }, , removeCookie] = useCookies(["accessToken"]);
  const [currentTab, setCurrentTab] = React.useState<string>("sao");
  const handleChange = (path: string, selectedTab: string) => {
    navigate(`/home${path}`);
    setCurrentTab(selectedTab);
  };
  const handleLogout = () => {
    removeCookie("accessToken", {
      path: "/",
      expires: new Date("Thu, 01 Jan 1970 00:00:00 GMT"),
    });
    navigate("/", { replace: true });
  };
  const [userData, setUserData] = React.useState({
    fullName: "",
    email: "",
    student_id: "",
    isStudent: true,
  });
  React.useEffect(() => {
    const decodeToken = () => {
      const { fullName, email, student_id, isStudent }: { fullName: string; email: string; student_id: string; isStudent: boolean } = jwtDecode(accessToken);
      setUserData({ fullName, email, student_id, isStudent });
    };
    decodeToken();
  }, [accessToken]);
  return (
    <>
      <Box
        sx={{
          transition: "background-color 300ms",
          transitionBehavior: "allow-discrete",
          position: "fixed",
          zIndex: 998,
          bgcolor: sidebarOpen ? "rgba(0,0,0,0.0)" : "rgba(0,0,0,0.5)",
          inset: 0,
          display: { md: "none", xs: "block" },
          pointerEvents: sidebarOpen ? "none" : "all",
          maxHeight: "100dvh",
        }}
      ></Box>
      <Box sx={{ padding: 2, paddingRight: 0, height: "calc(100dvh - 64px)", width: "100%", maxWidth: 275, marginLeft: { md: sidebarOpen ? "0" : "-275px", xs: sidebarOpen ? "-275px" : "0" }, transition: "margin 300ms", position: { md: "relative", xs: "fixed" }, zIndex: "999" }}>
        <nav aria-label="main mailbox folders">
          <List disablePadding>
            <ListItem
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "background.paper",
                borderRadius: 4,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                p: 2,
                py: 1,
                mb: 2,
              }}
              disablePadding
            >
              <AccountCircle sx={{ height: "100px", width: "100px" }} />
              <Typography gutterBottom variant="body1" component="div">
                {userData.fullName}
              </Typography>
              <Typography gutterBottom variant="caption" component="div" color="text.secondary">
                {userData.email}
              </Typography>
              <Typography gutterBottom variant="caption" component="div" color="text.secondary">
                {userData.isStudent ? userData.student_id : userData.email}
              </Typography>
              {userData.isStudent && (
                <Typography gutterBottom variant="caption" component="div" color="text.secondary">
                  Student
                </Typography>
              )}
            </ListItem>

            {/* <Divider /> */}
            {sideNav.map((item, index) => (
              <ListItem disablePadding key={index}>
                <ListItemButton
                  sx={{
                    borderRadius: 4,
                    "&.Mui-selected": {
                      bgcolor: "background.paper",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                      "& *": {
                        color: "primary.main",
                      },
                    },
                  }}
                  selected={currentTab === item.abbreviation}
                  onClick={() => handleChange(item.path, item.abbreviation)}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton
                sx={{
                  borderRadius: 4,
                  "&.Mui-selected": {
                    bgcolor: "background.paper",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    "& *": {
                      color: "primary.main",
                    },
                  },
                }}
                onClick={handleLogout}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <ExitToAppIcon />
                </ListItemIcon>
                <ListItemText primary={"Logout"} />
              </ListItemButton>
            </ListItem>
          </List>
        </nav>
      </Box>
    </>
  );
};

export default React.memo(Sidebar);
