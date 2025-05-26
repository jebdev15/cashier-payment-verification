import React from 'react'
import { Alert, Box, Paper, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { useAxios } from '../../hooks/useAxios'

const TransactionHistory = () => {
  const { data, loading, error } = useAxios({
    url: '/api/transactions/student-id',
    authorized: true,
  })
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'student_id', headerName: 'Student ID', width: 130, hide: true },
    { field: 'reference_code', headerName: 'Reference ID', width: 200 },
    { field: 'amount', headerName: 'Amount', width: 100 },
    { field: 'purpose', headerName: 'Purpose', width: 100 },
    { field: 'status', headerName: 'Status', width: 160 },
    { field: 'created_at', headerName: 'Created At', width: 160 },
  ]

  if (loading) return <p>Loading...</p>;
  if (error) return <Alert severity="error">{error}</Alert>;
  return (
    <Box sx={{ flexGrow: 1, paddingX: 4, paddingY: 2 }}>
      <Typography
        variant="h4"
        color="initial"
        sx={{ marginBottom: 2 }}
      >
        Transaction History
      </Typography>
      <Paper
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%"
        }}
      >
        <DataGrid
          rows={data}
          columns={columns}
          loading={loading}
        />
      </Paper>
    </Box>
  )
}

export default React.memo(TransactionHistory)