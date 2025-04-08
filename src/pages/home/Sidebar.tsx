import React from 'react'
import {
    AccountBalance as AccountBalanceIcon,
    FileUpload as FileUploadIcon,
    History as HistoryIcon,
    ExitToApp as ExitToAppIcon
} from '@mui/icons-material'
import { Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { useNavigate } from 'react-router'

const sideNav = [
    {
        path: "/",
        label: "Statement of Account",
        icon: AccountBalanceIcon
    },
    {
        path: "/upload-receipt",
        label: "Upload Receipt",
        icon: FileUploadIcon
    },
    {
        path: "/payment-history",
        label: "Payment History",
        icon: HistoryIcon
    }
]

const LazyImage = ({ src, alt }: { src: string, alt: string }) => {
    return (
        <img 
            src={src} 
            alt={alt} 
            height="100px" 
            width="100px" 
            loading="lazy" 
        />
    )
}
const Sidebar = () => {
    const navigate = useNavigate()
    const [currentTab, setCurrentTab] = React.useState<{ [key: string]: boolean }>({
        sao: false,
        ur: false,
        ph: false
    })
    const handleChange = (path: string) => navigate(path)
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
                            <LazyImage src={"https://media.cnn.com/api/v1/images/stellar/prod/2501-dw-3month-nonexclusive.jpg?c=16x9&q=h_653,w_1160,c_fill/f_webp"} alt="Christian Anthony Gemelo" />
                        </Box>
                        <Typography gutterBottom variant="body1" component="div">
                            Christian Anthony Gemelo
                        </Typography>
                    </ListItem>
  
                    <Divider />
                    {sideNav.map((item, index) => (
                        <ListItem disablePadding key={index}>
                            <ListItemButton onClick={() => handleChange(item.path)} className='navbtn active'>
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