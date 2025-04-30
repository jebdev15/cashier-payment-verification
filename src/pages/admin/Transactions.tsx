import React from 'react'
import { Alert, Box, ButtonGroup, IconButton, Paper, SelectChangeEvent, Typography } from '@mui/material'
import { 
  Subject as SubjectIcon,
  Photo as PhotoIcon
} from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
import { axiosInstance, axiosInstanceWithAuthorization } from '../../api/app'
import { useCookies } from 'react-cookie'
import { TransactionsType } from '../../types/transactions'

const TransactionHistory = () => {
  const [{ accessToken }] = useCookies(['accessToken']);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [data, setData] = React.useState<TransactionsType[]>([]);
  const [transactionStatus, setTransactionStatus] = React.useState<string | null>(null);
  const handleChangeTransactionStatus = (event: SelectChangeEvent<string>) => {
    setTransactionStatus(event.target.value);
  }
  const handleUpdateStatus = async (id: string | number, status: string) => {
    try {
      const { data } = await axiosInstance.put(`/api/transactions/${id}`, { status });
      setData(data);
      setTransactionStatus(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Error fetching data.");
    }
  }
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'student_id', headerName: 'Student ID', width: 130 },
    { field: 'fullName', headerName: 'Full name', width: 300 },
    { field: 'reference_code', headerName: 'Reference ID', width: 200 },
    { field: 'purpose', headerName: 'Purpose', width: 100 },
    { field: 'status', headerName: 'Status', width: 160 },
    { field: 'created_at', headerName: 'Created At', width: 160 },
    {
      field: 'action',
      headerName: 'Action',
      width: 160,
      renderCell: ({ row }: { row: TransactionsType }) => {
        return (
          <ButtonGroup>
            <IconButton color="primary" onClick={() => console.log(row.id)}>
              <PhotoIcon />
            </IconButton>
            <IconButton color="primary" onClick={() => console.log(row.id)}>
              <SubjectIcon />
            </IconButton>
          </ButtonGroup>
        )
      }
    }
  ]
  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchUploadReceiptLog = async () => {
      try {
        const { data } = await axiosInstanceWithAuthorization(accessToken).get('/api/transactions', { signal });
        setData(data);
      } catch (error) {
        console.error("Error uploading file:", error);
        if (signal.aborted) return;
        setError("Error fetching data.");
      } finally {
        setLoading(false);
      }
    }
    fetchUploadReceiptLog();
    return () => controller.abort();
  }, [accessToken]);
  if (loading) return <p>Loading...</p>;
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

export default React.memo(TransactionHistory)