import React from 'react'
import { RouterProvider } from 'react-router'
import { routes } from './router/routes'
import { CssBaseline } from '@mui/material'
import { CookiesProvider } from 'react-cookie'

function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <CookiesProvider>
        <RouterProvider router={routes} />
      </CookiesProvider>
    </React.Fragment>
  )
}

export default App