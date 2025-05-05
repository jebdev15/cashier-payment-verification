import React from 'react'
import { RouterProvider } from 'react-router'
import { routes } from './router/routes'
import { CssBaseline } from '@mui/material'
import { CookiesProvider } from 'react-cookie'
import { GoogleOAuthProvider } from '@react-oauth/google'

function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <CookiesProvider>
          <RouterProvider router={routes} />
        </CookiesProvider>
      </GoogleOAuthProvider>
    </React.Fragment>
  )
}

export default App