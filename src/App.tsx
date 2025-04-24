import { RouterProvider } from 'react-router'
// import './App.css'
import { routes } from './router/routes'
import { CssBaseline } from '@mui/material'
import React from 'react'
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