import React from 'react'
import { Alert, Box, IconButton, Paper, Tooltip, Typography, Divider } from '@mui/material'
import { Subject as SubjectIcon } from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
import { TransactionDataType } from './type'
import { useNavigate } from 'react-router'
import { useAxios } from '@/hooks/useAxios'
import TransactionModal from '@/components/modals/TransactionModal'

const ShowTransactions = () => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<TransactionDataType | null>(null);
  const [editable, setEditable] = React.useState(false);
  const { data, loading, error } = useAxios({
    url: '/api/transactions',
    authorized: true,
  });

  const columns = [
    { field: '_id', headerName: 'No.', width: 70 },
    { field: 'fullName', headerName: 'Full name', width: 180 },
    { field: 'reference_code', headerName: 'Reference ID', width: 160 },
    { field: 'status', headerName: 'Status', width: 120 },
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
        const handleClick = () => {
          setOpen(true);
          setSelectedRow(row);
          setEditable(row.status === 'pending');
        }
        return (
          <Tooltip title={row.status === "approved" ? "View" : "Edit"}>
            <IconButton color="primary" onClick={handleClick}>
              <SubjectIcon />
            </IconButton>
          </Tooltip>
        );
      }
    }
  ];

  const externalColumns = [
    { field: '_id', headerName: 'No.', width: 70 },
    { field: 'name_of_payor', headerName: 'Name of Institution/Agency', width: 250 },
    { field: 'reference_code', headerName: 'Reference ID', width: 160 },
    { field: 'status', headerName: 'Status', width: 120 },
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
        const handleClick = () => {
          setOpen(true);
          setSelectedRow(row);
        }
        return (
          <Tooltip title={row.status === "approved" ? "View" : "Edit"}>
            <IconButton color="primary" onClick={handleClick}>
              <SubjectIcon />
            </IconButton>
          </Tooltip>
        );
      }
    }
  ];

  if (error) return <Alert severity="error">{error}</Alert>;

  const studentTransactions = data?.filter((item: TransactionDataType) => item.userType === 'Student').map((item: TransactionDataType, index: number) => ({ ...item, _id: index + 1 })) || [];
  const externalTransactions = data?.filter((item: TransactionDataType) => item.userType === 'External').map((item: TransactionDataType, index: number) => ({ ...item, _id: index + 1 })) || [];

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h4" color="initial" sx={{ marginBottom: 2 }}>
          Transactions
        </Typography>

        <Typography variant="h6" mt={3} mb={1} color="secondary">
          External Transactions
        </Typography>
        <Paper sx={{ width: '100%', height: 400, mb: 4 }}>
          <DataGrid
            rows={externalTransactions}
            columns={externalColumns}
            loading={loading}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                lineHeight: 1.4,
                paddingTop: '8px',
                paddingBottom: '8px',
                alignContent: 'center',
              },
            }}
          />
        </Paper>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" mt={3} mb={1} color="primary">
          Student Transactions
        </Typography>
        <Paper sx={{ width: '100%', height: 400 }}>
          <DataGrid
            rows={studentTransactions}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                lineHeight: 1.4,
                paddingTop: '8px',
                paddingBottom: '8px',
                alignContent: 'center',
              },
            }}
          />
        </Paper>
      </Box>
      <TransactionModal
        open={open}
        onClose={() => setOpen(false)}
        data={selectedRow}
        editable={editable}
      />
    </React.Suspense>
  );
};

export default React.memo(ShowTransactions);
