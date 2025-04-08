import { RouterProvider } from 'react-router'
// import './App.css'
import { routes } from './router/routes'
import { CssBaseline } from '@mui/material'
import React from 'react'

function App() {
  return (
    <React.Fragment>
      <CssBaseline />
      <RouterProvider router={routes} />
    </React.Fragment>
  )
}

export default App