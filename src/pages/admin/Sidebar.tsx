import React from "react";
import { AccountCircle, ExitToApp as ExitToAppIcon } from "@mui/icons-material";
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useMediaQuery } from "@mui/material";
import { useNavigate, useLocation } from "react-router";
import { sideNav } from "./sideNav";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import { AdminLayoutContext } from "../../context/AdminLayoutContext";
import { theme } from "@/theme/theme";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMediumScreen = useMediaQuery("(max-width: 900px)");
  const { sidebarOpen } = React.useContext(AdminLayoutContext);
  const [{ accessToken }, , removeCookie] = useCookies(["accessToken"]);

  const getCurrentTab = () => {
    const path = location.pathname.replace("/admin", "");
    const currentNavItem = sideNav.find((item) => path === item.path || path.startsWith(`${item.path}/`));
    return currentNavItem?.abbreviation || "";
  };

  const [currentTab, setCurrentTab] = React.useState<string>(getCurrentTab());

  React.useEffect(() => {
    setCurrentTab(getCurrentTab());
  }, [location.pathname]);

  const handleChange = (path: string, selectedTab: string) => {
    navigate(`/admin${path}`);
    setCurrentTab(selectedTab);
  };
  const handleLogout = () => {
    removeCookie("accessToken", {
      path: "/",
      expires: new Date("Thu, 01 Jan 1970 00:00:00 GMT"),
    });
    navigate("/sign-in", { replace: true });
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
              <Typography gutterBottom variant="body1" component="div">
                {userData.fullName}
              </Typography>
              <Typography gutterBottom variant="caption" component="div" color="text.secondary">
                {userData.email}
              </Typography>
              {userData.isStudent && (
                <Typography gutterBottom variant="caption" component="div" color="text.secondary">
                  Student
                </Typography>
              )}
            </ListItem>

            <Box sx={{ px: 1, display: "grid", gap: 1 }}>
              {sideNav.map((item, index) => (
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
              ))}
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
