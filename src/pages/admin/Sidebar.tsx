import React from 'react'
import {
    ExitToApp as ExitToAppIcon
} from '@mui/icons-material'
import { Avatar, Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { useNavigate } from 'react-router'
import { sideNav } from './sideNav'

const Sidebar = () => {
    const navigate = useNavigate()
    const [currentTab, setCurrentTab] = React.useState<string>("")
    const handleChange = (path: string, selectedTab: string) => {
        navigate(`/admin${path}`)
        setCurrentTab(selectedTab)
    }
    return (
        <Box sx={{ width: '100%', maxWidth: 250, bgcolor: 'background.paper' }}>
            <nav aria-label="main mailbox folders">
                <List>
                    <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} disablePadding>
                        <Box 
                            sx={{ 
                                height: "100px", 
                                width: "100px",
                                backgroundColor: "#333"
                                }}
                            >
                            {/* Avatar nalang kuno hambal ni sir, indi na image. */}
                            <Avatar alt="Christian Anthony Gemelo" src="/static/images/avatar/1.jpg" />
                        </Box>
                        <Typography gutterBottom variant="body1" component="div">
                            Administrator
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
                        <ListItemButton>
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