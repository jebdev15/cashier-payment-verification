import React from 'react'
import { Box, Paper,Typography } from '@mui/material'
import ListOfUsersTable from './ListOfUsersTable'

const AccountManagement = () => {
  return (
    <Box sx={{ flexGrow: 1, paddingLeft: 5}}>
      <Typography variant="h4" color="initial">Statement of Account</Typography>
      <Paper 
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          alignItems: "center", 
          gap: 2, 
          height: "100%", 
          width: "100%" 
        }}
      >
          <ListOfUsersTable />
      </Paper>
    </Box>
  )
}

export default React.memo(AccountManagement)