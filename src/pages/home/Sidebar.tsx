import React from "react";
import { AccountCircle, ExitToApp as ExitToAppIcon } from "@mui/icons-material";
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
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
    user_id: "",
    payor_name: "",
    fullName: "",
    email: "",
    student_id: "",
    isStudent: false,
    isExternal: false,
  });
  React.useEffect(() => {
    const decodeToken = () => {
      const {
        payor_name,
        fullName,
        email,
        student_id,
        isStudent,
        isExternal,
      }: {
        payor_name: string;
        fullName: string;
        email: string;
        student_id: string;
        isStudent: boolean;
        isExternal: boolean;
      } = jwtDecode(accessToken);
      setUserData((prev) => ({
        ...prev,
        payor_name,
        fullName,
        email,
        student_id,
        isStudent,
        isExternal,
      }));
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
      <Box
        sx={{
          padding: 2,
          paddingRight: { md: "0", xs: "2" },
          height: "calc(100dvh - 64px)",
          width: "100%",
          maxWidth: 300,
          marginLeft: {
            md: sidebarOpen ? "0" : "-300px",
            xs: sidebarOpen ? "-300px" : "0",
          },
          transition: "margin 300ms",
          position: { md: "relative", xs: "fixed" },
          zIndex: "999",
          bgcolor: "#f0f0f0",
        }}
      >
        <nav style={{ display: "flex", height: "100%" }} aria-label="main mailbox folders">
          <List
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              flexGrow: 1,
            }}
            disablePadding
          >
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
              {userData.isStudent && (
                <Typography gutterBottom variant="body1" component="div">
                  {userData.fullName}
                </Typography>
              )}
              {userData.isExternal && (
                <Typography gutterBottom variant="body1" component="div">
                  {userData.payor_name}
                </Typography>
              )}
              <Typography gutterBottom variant="caption" component="div" color="text.secondary">
                {userData.email}
              </Typography>
              <Typography gutterBottom variant="caption" component="div" color="text.secondary">
                {userData.isStudent && userData.student_id}
              </Typography>
              {userData.isStudent && (
                <Typography gutterBottom variant="caption" component="div" color="text.secondary">
                  {userData.isStudent && "Student"}
                  {userData.isExternal && "External"}
                </Typography>
              )}
            </ListItem>

            {/* <Divider /> */}
            {sideNav.map((item, index) => {
              if (userData.isExternal && ["sao", "ur"].includes(item.abbreviation)) return null;
              if (userData.isStudent && item.abbreviation === "ur-ex") return null;
              return (
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
              );
            })}
            <ListItem sx={{ flexGrow: 1, alignItems: "end" }} disablePadding>
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
