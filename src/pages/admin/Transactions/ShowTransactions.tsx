import React from 'react'
import { Alert, Box, ButtonGroup, IconButton, Paper, Typography } from '@mui/material'
import { 
  Subject as SubjectIcon,
  Photo as PhotoIcon
} from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
import { axiosInstanceWithAuthorization } from '../../../api/app'
import { useCookies } from 'react-cookie'
import { TransactionDataType } from './type'
import { useNavigate } from 'react-router'
import { isAxiosError } from 'axios'

const ShowTransactions = () => {
  const [{ accessToken }] = useCookies(['accessToken']);
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<TransactionDataType[]>([]);
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'student_id', headerName: 'Student ID', width: 130 },
    { field: 'fullName', headerName: 'Full name', width: 300 },
    { field: 'reference_code', headerName: 'Reference ID', width: 200 },
    { field: 'purpose', headerName: 'Purpose', width: 100 },
    { field: 'status', headerName: 'Status', width: 160, color: 'error' },
    { field: 'created_at', headerName: 'Created At', width: 160 },
    {
      field: 'action',
      headerName: 'Action',
      width: 160,
      renderCell: ({ row }: { row: TransactionDataType }) => {
        return (
          <ButtonGroup>
            <IconButton color="primary" onClick={() => navigate(`/admin/transactions/${row.id}/${row.id}`)}>
              <PhotoIcon />
            </IconButton>
            <IconButton color="primary" onClick={() => navigate(`/admin/transactions/${row.id}`)}>
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
      setLoading(true);
      try {
        const { data } = await axiosInstanceWithAuthorization(accessToken).get('/api/transactions', { signal });
        setData(data);
      } catch (error) {
        if (signal.aborted) return;
        if(isAxiosError(error)) {
          if(error.request) return setError(error.request.response["message"]);
          if(error.response) return setError(error.response.data.message);
        }
        setError("Error fetching data.");
      } finally {
        setLoading(false);
      }
    }
    fetchUploadReceiptLog();
    return () => controller.abort();
  }, [accessToken]);
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