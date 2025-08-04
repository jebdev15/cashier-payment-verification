import React from 'react'
import { Alert, Box, IconButton, Paper, Typography, Divider, useMediaQuery, Tooltip } from '@mui/material'
import { Edit as EditIcon, Subject as SubjectIcon } from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { AccountDataType } from './type';
import { useAxios } from '../../../hooks/useAxios';

const ShowAccounts = () => {
  const navigate = useNavigate();
  const isMediumScreen = useMediaQuery('(max-width: 900px)');
  const { data, loading, error } = useAxios({
    url: '/api/users',
    authorized: true,
  });

  const columns = [
    { field: 'id', headerName: 'No.', width: 70 },
    // { field: 'student_id', headerName: 'Student ID', width: 130 },
    // { field: 'email', headerName: 'Email Address', width: 200 },
    { field: 'fullName', headerName: 'Full name', width: 250 },
    // { field: 'college', headerName: 'College', width: 200 },
    { field: 'program', headerName: 'Program', width: 200 },
    { field: 'yearLevel', headerName: 'Year Level', width: 100 },
    {
      field: 'status', headerName: 'Status', width: 90,
      renderCell: ({ row }: { row: AccountDataType }) => {
        return (
          <Typography variant="caption" sx={{ color: row.status === 'approved' ? 'green' : row.status === 'rejected' ? 'red' : 'orange' }}>{row.status.toUpperCase()}</Typography>
        )
      }
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 160,
      renderCell: ({ row }: { row: AccountDataType }) => {
        // if (row.status !== 'pending') return null;
        return (
          <Tooltip title={row.status === 'pending' ? 'Edit' : 'View'}>
            <IconButton color="primary" onClick={() => navigate(`/admin/accounts/${row.user_id}`)}>
              {(row.status === 'pending') ? <EditIcon /> : <SubjectIcon />}
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];
  const externalUserColumns = [
    { field: 'id', headerName: 'No.', width: 70 },
    { field: 'payor_name', headerName: 'Name of Institution/Agency', width: 250 },
    { field: 'email', headerName: 'Email Address', width: 200 },
    {
      field: 'status', headerName: 'Status', width: 90,
      renderCell: ({ row }: { row: AccountDataType }) => {
        return (
          <Typography variant="caption" sx={{ color: row.status === 'approved' ? 'green' : row.status === 'rejected' ? 'red' : 'orange' }}>{row.status.toUpperCase()}</Typography>
        )
      }
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 160,
      renderCell: ({ row }: { row: AccountDataType }) => {
        // if (row.status !== 'pending') return null;
        return (
          <Tooltip title={row.status === 'pending' ? 'Edit' : 'View'}>
            <IconButton color="primary" onClick={() => navigate(`/admin/accounts/${row.user_id}`)}>
              {(row.status === 'pending') ? <EditIcon /> : <SubjectIcon />}
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];
  if (error) return <Alert severity="error">{error}</Alert>;

  const studentAccounts = data?.filter((item: AccountDataType) => item.userType === 'Student').map((item: AccountDataType, index: number) => ({ ...item, id: ++index, user_id: item.id })) || [];
  const externalAccounts = data?.filter((item: AccountDataType) => item.userType === 'External').map((item: AccountDataType, index: number) => ({ ...item, id: ++index, user_id: item.id })) || [];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant={isMediumScreen ? "h5" : "h4"} color="initial" gutterBottom>
        User Account Management
      </Typography>

      <Typography variant="h6" mt={3} mb={1} color="secondary">
        External User Accounts
      </Typography>
      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          columns={externalUserColumns}
          rows={externalAccounts}
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
        Student User Accounts
      </Typography>
      <Paper sx={{ height: 400, width: '100%', mb: 4 }}>
        <DataGrid
          columns={columns}
          rows={studentAccounts}
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
  );
};

export default React.memo(ShowAccounts);
