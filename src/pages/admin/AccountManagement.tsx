import React from 'react'
import { Box, IconButton, Paper,Typography } from '@mui/material'
import { Subject as SubjectIcon } from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid';
import { axiosInstance } from '../../api/app';
import { isAxiosError } from 'axios';

type AccountManagementType = {
  id: number,
  student_id: string,
  email: string,
  fullName: string,
  status: string
}
const AccountManagement = () => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [rows, setRows] = React.useState<AccountManagementType[]>([]);
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'student_id', headerName: 'Student ID', width: 130 },
    { field: 'email', headerName: 'Email Address', width: 200 },
    { field: 'fullName', headerName: 'Full name', width: 400 },
    { field: 'status', headerName: 'Status', width: 90 },
    {
      field: 'action',
      headerName: 'Action',
      width: 160,
      renderCell: ({ row }: {row: AccountManagementType}) => {
        return (
          <IconButton color="primary" onClick={() => console.log(row.id)}>
            <SubjectIcon />
          </IconButton>
        )
      }
    }
  ]
  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get("/api/users", { signal });
        setRows(data);
      } catch (error) {
        if(signal.aborted) return;
        if(isAxiosError(error)) {
          if(error.request) return alert(error.request.response["message"])
          if(error.response) return alert(error.response.data.message)
        }
        alert("Something went wrong")
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
    return () => controller.abort();
  },[])
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
            rows={rows}
            loading={loading}
            showToolbar
          />
      </Paper>
    </Box>
  )
}

export default React.memo(AccountManagement)