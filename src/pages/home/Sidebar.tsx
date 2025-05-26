import React from 'react'
import { AccountCircle, ExitToApp as ExitToAppIcon } from '@mui/icons-material'
import { Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { useNavigate } from 'react-router'
import { sideNav } from './sideNav'
import { useCookies } from 'react-cookie'
import { HomeLayoutContext } from '../../context/HomeLayoutContext'
import { jwtDecode } from 'jwt-decode'

const Sidebar = () => {
    const { sidebarOpen } = React.useContext(HomeLayoutContext)
    const navigate = useNavigate()
    const [{ accessToken },,removeCookie] = useCookies(['accessToken'])
    const [currentTab, setCurrentTab] = React.useState<string>("")
    const handleChange = (path: string, selectedTab: string) => {
        navigate(`/home${path}`)
        setCurrentTab(selectedTab)
    }
    const handleLogout = () => {
        removeCookie("accessToken", { 
            path: "/", 
            expires: new Date("Thu, 01 Jan 1970 00:00:00 GMT")
        })
        navigate("/", { replace: true })
    }
    const [userData, setUserData] = React.useState({
        fullName: "",
        email: "",
        student_id: "",
        isStudent: true
    })
    React.useEffect(() => {
        const decodeToken = () => {
            const { fullName, email, student_id, isStudent }: { fullName: string, email: string, student_id: string, isStudent: boolean } = jwtDecode(accessToken)
            setUserData({ fullName, email, student_id, isStudent })
        }
        decodeToken()
    },[accessToken])
    return (
        <Box sx={{ width: '100%', maxWidth: 250, bgcolor: 'background.paper', display: sidebarOpen ? "block" : "none", marginRight: sidebarOpen ? 5 : 0 }}>
            <nav aria-label="main mailbox folders">
                <List>
                    <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} disablePadding>
                        <AccountCircle sx={{ height: "100px", width: "100px" }} />
                        <Typography gutterBottom variant="body1" component="div">{userData.fullName}</Typography>
                        <Typography gutterBottom variant="caption" component="div" color="text.secondary">{userData.email}</Typography>
                        <Typography gutterBottom variant="caption" component="div" color="text.secondary">{userData.isStudent ? userData.student_id : userData.email}</Typography>
                        {userData.isStudent && <Typography gutterBottom variant="caption" component="div" color="text.secondary">Student</Typography>}
                    </ListItem>
  
                    <Divider />
                    {sideNav.map((item, index) => (
                        <ListItem disablePadding key={index}>
                            <ListItemButton 
                                selected={currentTab === item.abbreviation} 
                                onClick={() => handleChange(item.path, item.abbreviation)} 
                            >
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