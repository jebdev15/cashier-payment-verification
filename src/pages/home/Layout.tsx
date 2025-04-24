import React from 'react'
import { Box } from '@mui/material'
import { Outlet, useNavigate } from 'react-router'
import Header from './Header'
import Sidebar from './Sidebar'
import { useCookies } from 'react-cookie'
import { jwtDecode } from 'jwt-decode'
const Layout = () => {
  const navigate = useNavigate()
  const [{ accessToken }] = useCookies(['accessToken'])
  const [loading, setLoading] = React.useState<boolean>(true)
  React.useEffect(() => {
    const checkSession = () => {
      if (!accessToken) return navigate("/", { replace: true })
      const { isAuthenticated }: { isAuthenticated: boolean | number } = jwtDecode(accessToken)
      console.log({ isAuthenticated })
      if (!isAuthenticated) return navigate("/", { replace: true })
      setLoading(false)

    }
    checkSession()
  }, [accessToken])

  return (
    !loading &&
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        padding: 0,
        margin: 0,
        backgroundColor: '#f5f5f5'
      }}
    >
      <Header />
      <Box sx={{ display: 'flex', height: '100%', flex: 1 }}>
        <Sidebar />
        <Outlet />
      </Box>
    </Box>
  )
}

export default React.memo(Layout)