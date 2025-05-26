import React from 'react'
import { Box, Typography, Alert, FormControl, Select, MenuItem, Button, InputLabel } from '@mui/material'
import { useNavigate, useParams } from 'react-router'
import { useAxios } from '../../../hooks/useAxios'
import { isAxiosError } from 'axios'
import { axiosInstanceWithAuthorization } from '../../../api/app'
import { useCookies } from 'react-cookie'
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
const EditTransaction = () => {
    const navigate = useNavigate()
    const [{ accessToken }] = useCookies(['accessToken'])
    const { transactionId } = useParams()
    const [dataToUpdate, setDataToUpdate] = React.useState<TransactionDataType>(initialTransactionData)
    const [loadingImage, setLoadingImage] = React.useState<boolean>(true)
    const [loadingForm, setLoadingForm] = React.useState<boolean>(false)
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
    }, [data])
    const handleOpenReceipt = () => {
        try {
            window.open(`${import.meta.env.VITE_API_URL}/${dataToUpdate?.filePath}`, '_blank')
        } catch (error) {
            console.error('Failed to open receipt:', error)
        }
    }
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoadingForm(true);
        const formData = new FormData();
        formData.append('status', dataToUpdate.status);
        try {
            const { data } = await axiosInstanceWithAuthorization(accessToken).put(`/api/transactions/${dataToUpdate.id}`, formData);
            alert(data.message);
            if (!data) return;
            navigate("/admin/transactions", { replace: true });
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.request) return alert(JSON.parse(error.request.toString()).message);
                if (error.response) return alert(JSON.parse(error.response.toString()).message);
            }
        } finally {
            setLoadingForm(false);
        }
    }
    if (loading) return <Typography>Loading...</Typography>
    if (error) return <Alert severity="error">{error}</Alert>
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', padding: 0, margin: 0 }}>
            <Box sx={{ p: 4 }}>
                <Typography variant="h5">Transaction ID: {transactionId}</Typography>
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
                        <Typography>View receipt here: <Button onClick={handleOpenReceipt}>View Receipt</Button></Typography>
                    ) : (
                        <Typography>No receipt image found.</Typography>
                    )
                }
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    // alignItems: "center",
                    alignContent: "center",
                    gap: 2,
                    height: "100%",
                    width: "100%",
                    paddingX: 5,
                }}
                component="form"
                onSubmit={handleSubmit}
            >
                <Typography variant="body1" color="initial">Student ID: {dataToUpdate?.student_id}</Typography>
                <Typography variant="body1" color="initial">Name: {dataToUpdate?.fullName}</Typography>
                <Typography variant="body1" color="initial">Reference Number: {dataToUpdate?.reference_code}</Typography>
                <Typography variant="body1" color="initial">Purpose: {dataToUpdate?.purpose}</Typography>
                <Typography variant="body1" color="initial">Amount: {dataToUpdate?.amount}</Typography>
                {/* <Typography variant="body1" color="initial">{dataToUpdate?.created_at}</Typography>
                <Typography variant="body1" color="initial">{dataToUpdate?.expires_at}</Typography> */}
                { data && data[0]?.status === "approved" 
                ? <Typography variant="body1" color="initial">Status: {data[0]?.status}</Typography>
                : (
                <FormControl sx={{ width: { xs: "100%", md: 320 } }}>
                    <InputLabel id="status">Status</InputLabel>
                    <Select
                        value={dataToUpdate?.status}
                        labelId="status"
                        label="Status"
                        name="status"
                        disabled={data && data[0]?.status === "approved"}
                        onChange={(e) => setDataToUpdate((prev) => ({ ...prev, status: e.target.value }))}
                    >
                        <MenuItem value={"pending"}>Pending</MenuItem>
                        <MenuItem value={"approved"}>Approve</MenuItem>
                        <MenuItem value={"rejected"}>Reject</MenuItem>
                    </Select>
                </FormControl>
                )}
                { data && data[0]?.status !== "approved" && <Button type="submit" variant="contained" disabled={loadingForm} sx={{ width: { xs: "100%", md: 320 } }}>{loadingForm ? "Updating..." : "Update"}</Button> }
            </Box>
        </Box>
    )
}

export default React.memo(EditTransaction)