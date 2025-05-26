import React from 'react'
import { Alert, Box, IconButton, Paper,Typography } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { AccountDataType } from './type';
import { useAxios } from '../../../hooks/useAxios';


const ShowAccounts = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useAxios({
    url: '/api/users',
    authorized: true,
  })
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'student_id', headerName: 'Student ID', width: 130 },
    { field: 'email', headerName: 'Email Address', width: 200 },
    { field: 'fullName', headerName: 'Full name', width: 300 },
    { field: 'college', headerName: 'College', width: 300 },
    { field: 'program', headerName: 'Program', width: 300 },
    { field: 'yearLevel', headerName: 'Year Level', width: 100 },
    { field: 'status', headerName: 'Status', width: 90 },
    {
      field: 'action',
      headerName: 'Action',
      width: 160,
      renderCell: ({ row }: {row: AccountDataType}) => {
        return (
          <IconButton color="primary" onClick={() => navigate(`/admin/accounts/${row.id}`)}>
            <EditIcon />
          </IconButton>
        )
      }
    }
  ]
  if(error) return <Alert severity="error">{error}</Alert>
  return (
    <Box sx={{ flexGrow: 1, paddingLeft: 5}}>
      <Typography variant="h4" color="initial">Account Management</Typography>
      <Paper 
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: 2, 
          height: "100%", 
          width: "100%" 
        }}
      >
          <DataGrid
            columns={columns}
            rows={data}
            loading={loading}
            showToolbar
          />
      </Paper>
    </Box>
  )
}

export default React.memo(ShowAccounts)