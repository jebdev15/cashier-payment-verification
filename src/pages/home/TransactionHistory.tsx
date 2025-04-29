import React from 'react'
import { Alert, Box, Paper, Typography } from '@mui/material'
import { axiosInstanceWithAuthorization } from '../../api/app'
import { useCookies } from 'react-cookie'
import { FileUploadLogType } from '../../types/fileUpload'
import { DataGrid } from '@mui/x-data-grid'

const TransactionHistory = () => {
  const [{ accessToken }] = useCookies(['accessToken']);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [data, setData] = React.useState<FileUploadLogType[]>([]);
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'student_id', headerName: 'Student ID', width: 130, hide: true },
    { field: 'reference_code', headerName: 'Reference ID', width: 200 },
    // { field: 'payment_id', headerName: 'Payment ID', width: 100 },
    { field: 'purpose', headerName: 'Purpose', width: 100 },
    { field: 'status', headerName: 'Status', width: 160 },
    { field: 'created_at', headerName: 'Created At', width: 160 },
  ]
  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const fetchUploadReceiptLog = async () => {
      try {
        const { data, status } = await axiosInstanceWithAuthorization(accessToken).get('/api/soa/transactions', { signal });
        setData(data);
        console.log(data, status);
      } catch (error) {
        console.error("Error uploading file:", error);
        if(signal.aborted) return;
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