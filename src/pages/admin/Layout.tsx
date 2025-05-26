import React from 'react'
import { Box, CircularProgress } from '@mui/material'
import { Outlet, useNavigate } from 'react-router'
import Header from './Header'
import Sidebar from './Sidebar'
import { useCookies } from 'react-cookie'
import { jwtDecode } from 'jwt-decode'

type JWTDecodeDataType = {
  isAuthenticated: boolean | number
  isStudent: boolean | number
  isAdministrator: boolean | number
}
const Layout = () => {
  const [{ accessToken }] = useCookies(['accessToken'])
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState<boolean>(true)
  const checkSession = () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (!accessToken) return navigate("/sign-in", { replace: true })
        const { isAuthenticated, isStudent, isAdministrator }: JWTDecodeDataType = jwtDecode(accessToken)
        if (!isAuthenticated) return navigate("/sign-in", { replace: true })
        if (!isAdministrator) return navigate("/sign-in", { replace: true })
        if (isStudent) return navigate("/sign-in", { replace: true })
        resolve(setLoading(false))
      }, 1000)
    })
  }
  React.useEffect(() => {
    const verifySession = async () => {
      await checkSession()
    }
    verifySession()
  }, [accessToken])
  if (loading) return <CircularProgress />
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      padding: 0,
      margin: 0,
      backgroundColor: '#f5f5f5'
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