import React from 'react'
import { Box, Button, FormControl, FormLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import { axiosInstance } from '../../../api/app';
import { isAxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router';
import { TransactionDataType } from './type';

const initialTransactionData: TransactionDataType = {
    id: 0,
    fullName: "",
    student_id: "",
    reference_code: "",
    payment_id: "",
    purpose: "",
    status: "",
    expires_at: new Date(),
    created_at: new Date(),
}
const TransactionAccount = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = React.useState<{ form: boolean; fetch: boolean }>({ form: false, fetch: false });
    const [dataToUpdate, setDataToUpdate] = React.useState<TransactionDataType>(initialTransactionData);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading((prevState) => ({ ...prevState, form: true }));
        const formData = new FormData(event.currentTarget);
        try {
            const { data } = await axiosInstance.put(`/api/transactions/${dataToUpdate.id}`, formData);
            if (!data) return;
            alert(data.message);
            navigate("/admin/transactions", { replace: true });
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.request) return alert(JSON.parse(error.request.toString()).message);
                if (error.response) return alert(JSON.parse(error.response.toString()).message);
            }
        } finally {
            setLoading((prevState) => ({ ...prevState, form: false }));
        }
    }
    React.useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        const fetchUser = async () => {
            setLoading((prevState) => ({ ...prevState, fetch: true }));
            try {
                const { data } = await axiosInstance.get(`/api/transactions/${id}`, { signal });
                setDataToUpdate(data[0]);
            } catch (error) {
                if (signal.aborted) return;
                if (isAxiosError(error)) {
                    if (error.request) return alert(error.request.response["message"]);
                    if (error.response) return alert(error.response.data.message);
                }
            } finally {
                setLoading((prevState) => ({ ...prevState, fetch: false }));
            }
        }
        fetchUser();
        return () => controller.abort();
    }, [id])
    if (loading.fetch) return <div>Loading...</div>
    return (
        <Box sx={{ flexGrow: 1, paddingLeft: 5, width: "100%", bgcolor: "#f5f5f5" }}>
            <Typography variant="h4" color="initial">Edit Transaction</Typography>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    height: "100%",
                    maxWidth: 500,
                }}
                component="form"
                onSubmit={handleSubmit}
            >
                <FormControl fullWidth>
                    <TextField
                        label="Student ID"
                        variant="outlined"
                        value={dataToUpdate.student_id}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <TextField
                        label="First Name"
                        variant="outlined"
                        value={dataToUpdate.fullName}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <TextField
                        label="Reference Code"
                        variant="outlined"
                        value={dataToUpdate.reference_code}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <TextField
                        label="Payment ID"
                        variant="outlined"
                        value={dataToUpdate.payment_id}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <TextField
                        label="Purpose"
                        variant="outlined"
                        value={dataToUpdate.purpose}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <TextField
                        label="Created At"
                        variant="outlined"
                        value={dataToUpdate.created_at}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <TextField
                        label="Expires At"
                        variant="outlined"
                        value={dataToUpdate.expires_at}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <FormLabel id="status">Status</FormLabel>
                    <Select
                        value={dataToUpdate.status}
                        labelId="status"
                        label="Status"
                        name="status"
                        onChange={(e) => setDataToUpdate((prev) => ({ ...prev, status: e.target.value }))}
                    >
                        <MenuItem value={"pending"}></MenuItem>
                        <MenuItem value={"approved"}>Approve</MenuItem>
                        <MenuItem value={"rejected"}>Reject</MenuItem>
                    </Select>
                </FormControl>
                <Button type="submit" variant="contained" disabled={loading.form}>{loading.form ? "Updating..." : "Update"}</Button>
            </Box>
        </Box>
    )
}

export default React.memo(TransactionAccount)