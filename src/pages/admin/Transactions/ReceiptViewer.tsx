import React from 'react'
import { Box, Typography, Paper, Alert, FormControl, TextField, Select, MenuItem, Button, InputLabel } from '@mui/material'
import { useParams } from 'react-router'
import { LazyImage } from '../../../components/LazyImage'
import { useAxios } from '../../../hooks/useAxios'
type TransactionDataType = {
  id: number
  fullName: string
  student_id: string
  reference_code: string
  payment_id: string
  amount: number | string
  purpose: string
  filePath: string
  referenceId: string
  status: string
  expires_at: Date
  created_at: Date
}

const initialTransactionData: TransactionDataType = { 
  id: 0,
  fullName: "",
  student_id: "",
  reference_code: "",
  payment_id: "",
  amount: 0,
  purpose: "",
  filePath: "",
  referenceId: "",
  status: "pending",
  expires_at: new Date(),
  created_at: new Date(),
}
const ReceiptViewer = () => {
  const { transactionId } = useParams()
  const [dataToUpdate, setDataToUpdate] = React.useState<TransactionDataType>(initialTransactionData)
  const [loadingImage, setLoadingImage] = React.useState<boolean>(true)
  const { data, loading, error } = useAxios({
    url: `/api/transactions/${transactionId}`,
    authorized: true,
  })
  React.useEffect(() => {
    if (data) {
      setDataToUpdate(data[0])
      setLoadingImage(false);
      console.log(`${import.meta.env.VITE_API_URL}/${data[0]?.filePath}`)
    }
  },[data])
  if (error) return <Alert severity="error">{error}</Alert>
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', padding: 0, margin: 0 }}>
      <Box sx={{ p: 4 }}>
        <Typography variant="h5">Receipt for Transaction ID: {transactionId}</Typography>
        {/* <Paper sx={{ mt: 2, p: 2, textAlign: 'center' }}>
          {loadingImage ? (
            <Typography>Loading receipt...</Typography>
          ) : dataToUpdate?.filePath ? (
            <img src={`${import.meta.env.VITE_API_URL}/${dataToUpdate?.filePath}`} alt="Receipt" style={{ minWidth: 300, maxHeight: 500 }} loading='lazy' />
          ) : (
            <Typography>No receipt image found.</Typography>
          )}
        </Paper> */}
        {
          loadingImage ? (
            <Typography>Loading receipt...</Typography>
          ) : dataToUpdate?.filePath ? (
            <Typography>View receipt here: <a href={`${import.meta.env.VITE_API_URL}/${dataToUpdate?.filePath}`} target="_blank">Receipt</a></Typography>
          ) : (
            <Typography>No receipt image found.</Typography>
          )
        }
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          alignContent: "center",
          gap: 2,
          height: "100%",
          width: "100%",
          paddingX: 5,
        }}
        component="form"
      // onSubmit={handleSubmit}
      >
        <FormControl fullWidth>
          <TextField
            label="Student ID"
            variant="outlined"
            value={dataToUpdate?.student_id}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="First Name"
            variant="outlined"
            value={dataToUpdate?.fullName}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Reference Code"
            variant="outlined"
            value={dataToUpdate?.reference_code}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Payment ID"
            variant="outlined"
            value={dataToUpdate?.payment_id}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Purpose"
            variant="outlined"
            value={dataToUpdate?.purpose}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Amount"
            variant="outlined"
            value={dataToUpdate?.amount}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Created At"
            variant="outlined"
            value={dataToUpdate?.created_at}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            label="Expires At"
            variant="outlined"
            value={dataToUpdate?.expires_at}
          />
        </FormControl>
        <FormControl fullWidth>
          <InputLabel id="status">Status</InputLabel>
          <Select
            value={dataToUpdate?.status}
            labelId="status"
            label="Status"
            name="status"
          // onChange={(e) => setDataToUpdate((prev) => ({ ...prev, status: e.target.value }))}
          >
            <MenuItem value={"pending"}>Pending</MenuItem>
            <MenuItem value={"approved"}>Approve</MenuItem>
            <MenuItem value={"rejected"}>Reject</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" disabled={loading.form}>{loading.form ? "Updating..." : "Update"}</Button>
      </Box>
    </Box>
  )
}

export default React.memo(ReceiptViewer)