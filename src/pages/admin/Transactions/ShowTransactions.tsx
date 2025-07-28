import React from 'react'
import { Alert, Box, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import { 
  Subject as SubjectIcon,
} from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
import { TransactionDataType } from './type'
import { useNavigate } from 'react-router'
import { useAxios } from '../../../hooks/useAxios'

const ShowTransactions = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useAxios({
    url: '/api/transactions',
    authorized: true,
  })
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'student_id', headerName: 'Student ID', width: 130 },
    { field: 'fullName', headerName: 'Full name', width: 300 },
    { field: 'reference_code', headerName: 'Reference ID', width: 200 },
    { field: 'amount', headerName: 'Amount', width: 100 },
    { field: 'purpose', headerName: 'Purpose', width: 100 },
    { field: 'status', headerName: 'Status', width: 160, color: 'error' },
    { 
      field: 'created_at', 
      headerName: 'Created At', 
      width: 160,
      valueGetter: (value: string) => new Date(value).toLocaleString()
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 160,
      renderCell: ({ row }: { row: TransactionDataType }) => {
        return (
          <Tooltip title={ row.status === "approved" ? "View" : "Edit" } >
            <IconButton color="primary" onClick={() => navigate(`/admin/transactions/${row.id}`)}>
              <SubjectIcon />
            </IconButton>
          </Tooltip>
        )
      }
    }
  ]

  if (error) return <Alert severity="error">{error}</Alert>;
  return (
    <Box sx={{ flexGrow: 1, paddingX: 4, paddingY: 2 }}>
      <Typography
        variant="h4"
        color="initial"
        sx={{ marginBottom: 2 }}
      >
        Transactions
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
          showToolbar
          sx={{ textAlign: 'center' }}
        />
      </Paper>
    </Box>
  )
}

export default React.memo(ShowTransactions)