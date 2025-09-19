import React from "react";
import { AccountCircle, ExitToApp as ExitToAppIcon } from "@mui/icons-material";
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { sideNav } from "./sideNav";
import { useCookies } from "react-cookie";
import { HomeLayoutContext } from "../../context/HomeLayoutContext";
import { jwtDecode } from "jwt-decode";
import { theme } from "@/theme/theme";

const SidebarListItems = ({ userType, item: { abbreviation, path, label, icon }, handleChange }: any) => {
  const isDisabled = (userType: string) => {
    if (userType === "student" && abbreviation === "ur-emp") return true;
    if (userType === "external" && abbreviation === "ur-emp") return true;
    if (userType === "employee" && abbreviation === "ur-ex") return true;
    return false;
  };

  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={() => handleChange(path, abbreviation)}
        disabled={isDisabled(userType)}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={label} />
      </ListItemButton>
    </ListItem>
  );
};

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
    isEmployee: false,
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
        isEmployee,
      }: {
        payor_name: string;
        fullName: string;
        email: string;
        student_id: string;
        isStudent: boolean;
        isExternal: boolean;
        isEmployee: boolean;
      } = jwtDecode(accessToken);
      setUserData((prev) => ({
        ...prev,
        payor_name,
        fullName,
        email,
        student_id,
        isStudent,
        isExternal,
        isEmployee
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
          height: { sm: "calc(100dvh - 72px)", xs: "calc(100dvh - 64px)" },
          width: "100%",
          maxWidth: 300,
          flexShrink: 0,
          marginLeft: { md: sidebarOpen ? "0" : "-300px", xs: sidebarOpen ? "-300px" : "0" },
          transition: "margin 300ms",
          position: { md: "sticky", xs: "fixed" },
          top: { md: "72px", xs: "unset" },
          zIndex: "999",
          bgcolor: { md: "#f0f0f0", xs: "transparent" },
        }}
      >
        <nav style={{ display: "flex", height: "100%" }} aria-label="main mailbox folders">
          <List sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1, backgroundColor: "background.paper", borderRadius: 4, boxShadow: 2, overflow: "hidden" }} disablePadding>
            <ListItem
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "background.paper",
                py: 1,
                px: 2,
                borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
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

            <Box sx={{ px: 1, display: "grid", gap: 1 }}>
              {sideNav.map((item, index) => {
                if (userData.isExternal && ["sao", "ur"].includes(item.abbreviation)) return null;
                if (userData.isEmployee && ["sao", "ur"].includes(item.abbreviation)) return null;
                if (userData.isStudent && item.abbreviation === "ur-ex") return null;
                if (userData.isStudent && item.abbreviation === "ur-emp") return null;
                if (userData.isExternal && item.abbreviation === "ur-emp") return null;
                if (userData.isEmployee && item.abbreviation === "ur-ex") return null;
                return (
                  <ListItem disablePadding key={index}>
                    <ListItemButton
                      sx={{
                        borderRadius: 3,
                        "&.Mui-selected": {
                          bgcolor: `color-mix(in srgb, ${theme.palette.primary.main} 75%, transparent)`,
                          "& *": {
                            color: "white",
                          },
                          "&:hover": {
                            bgcolor: `color-mix(in srgb, ${theme.palette.primary.main} 75%, transparent)`,
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
            </Box>
            <ListItem sx={{ flexGrow: 1, alignItems: "end" }} disablePadding>
              <Box sx={{ width: "100%", p: 1, borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                <ListItemButton
                  sx={{
                    borderRadius: 3,
                    "&.Mui-selected": {
                      bgcolor: `color-mix(in srgb, ${theme.palette.primary.main} 75%, transparent)`,
                      "& *": {
                        color: "white",
                      },
                      "&:hover": {
                        bgcolor: `color-mix(in srgb, ${theme.palette.primary.main} 75%, transparent)`,
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
              </Box>
            </ListItem>
          </List>
        </nav>
      </Box>
    </>
  );
};

export default React.memo(Sidebar);
