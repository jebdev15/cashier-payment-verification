import React from 'react'
import {
    AccountCircle,
    ExitToApp as ExitToAppIcon
} from '@mui/icons-material'
import { Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { useNavigate } from 'react-router'
import { sideNav } from './sideNav'
import { AdminLayoutContext } from '../../context/AdminLayoutContext'
import { useCookies } from 'react-cookie'

const Sidebar = () => {
    const navigate = useNavigate()
    const [cookie, setCookie] = useCookies()
    const { sidebarOpen } = React.useContext(AdminLayoutContext)
    const [currentTab, setCurrentTab] = React.useState<string>("")
    const handleChange = (path: string, selectedTab: string) => {
        navigate(`/admin${path}`)
        setCurrentTab(selectedTab)
    }
    const handleLogout = () => {
        setCookie("accessToken", "", { path: "/", expires: new Date("Thu, 01 Jan 1970 00:00:00 GMT") })
        setCookie("fullName", "", { path: "/", expires: new Date("Thu, 01 Jan 1970 00:00:00 GMT") })
        navigate("/sign-in", { replace: true })
    }
    return (
        <Box sx={{ width: '100%', maxWidth: 250, bgcolor: 'background.paper', display: sidebarOpen ? "block" : "none" }}>
            <nav aria-label="main mailbox folders">
                <List>
                    <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} disablePadding>
                        <AccountCircle sx={{ height: 100, width: 100 }} />
                        <Typography gutterBottom variant="body1" component="div">
                            {cookie.fullName}
                        </Typography>
                        <Typography gutterBottom variant="caption" component="div" color="text.secondary">
                            Administrator
                        </Typography>
                    </ListItem>
  
                    <Divider />
                    {sideNav.map((item, index) => (
                        <ListItem disablePadding key={index}>
                            <ListItemButton selected={currentTab === item.abbreviation} onClick={() => handleChange(item.path, item.abbreviation)}>
                                <ListItemIcon>
                                    <item.icon />
                                </ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleLogout}>
                            <ListItemIcon>
                                <ExitToAppIcon />
                            </ListItemIcon>
                            <ListItemText primary={"Logout"} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </nav>
        </Box>
    )
}

export default React.memo(Sidebar)