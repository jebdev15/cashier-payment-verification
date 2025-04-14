import React from 'react'
import { Box } from '@mui/material'
import { Outlet } from 'react-router'
import Header from './Header'   
import Sidebar from './Sidebar'
const Layout = () => {
  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      padding: 0,
      margin: 0
     }}>
            <Header />
            <Box sx={{ display: 'flex', height: '100%', flex: 1 }}>
                <Sidebar />
                <Outlet />
            </Box>
    </Box>
  )
}

export default React.memo(Layout)