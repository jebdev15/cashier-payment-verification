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
    <Box 
      sx={{
      display: "flex",
      flexDirection: "column",
      height: "100dvh",
      width: "100%",
      backgroundColor: "#f0f0f0",
      overflow: "hidden",
    }}
    >
      <Header />
      <Box sx={{ display: 'flex', pt: "64px", height: '100%', flex: 1 }}>
        <Sidebar />
        <Box sx={{ flex: 1, padding: 2, overflow: "auto" }}>
          <Box sx={{ bgcolor: "background.paper", borderRadius: 4, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)", px: { xs: 1, md: 5 }, py: 4, minHeight: "100%" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default React.memo(Layout)