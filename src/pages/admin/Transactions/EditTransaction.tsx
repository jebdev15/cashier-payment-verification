import React from 'react'
import { Box, Typography, Alert, FormControl, Select, MenuItem, Button, InputLabel, Grid, TextField } from '@mui/material'
import { useNavigate, useParams } from 'react-router'
import { useAxios } from '../../../hooks/useAxios'
import { isAxiosError } from 'axios'
import { axiosInstanceWithAuthorization } from '../../../api/app'
import { useCookies } from 'react-cookie'
import { fees } from './fees'

type TransactionDataType = {
    id: number
    fullName: string
    student_id: string
    reference_code: string
    payment_id: string
    amount: number | string
    account: string
    particulars: string
    remarks: string
    details: string
    purpose: string
    filePath: string
    referenceId: string
    status: string
    expires_at: Date
    created_at: Date
}

const initialTransactionData: TransactionDataType = {
    id: 0,
    name_of_payor: "",
    student_id: "",
    reference_code: "",
    payment_id: "",
    amount: 0,
    account: "",
    particulars: "",
    remarks: "",
    details: "",
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
    const [image, setImage] = React.useState<string | null>(null)
    const [dataToUpdate, setDataToUpdate] = React.useState<TransactionDataType>(initialTransactionData)
    const [loadingImage, setLoadingImage] = React.useState<boolean>(true)
    const [loadingForm, setLoadingForm] = React.useState<boolean>(false)
    const [selectedAccount, setSelectedAccount] = React.useState('');
    const [filteredParticulars, setFilteredParticulars] = React.useState<string[]>([]);
    const { data, loading, error } = useAxios({
        url: `/api/transactions/${transactionId}`,
        authorized: true,
    })
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
    React.useEffect(() => {
        if (selectedAccount) {
            const filtered = fees
                .filter((item) => item.categories.includes(selectedAccount))
                .map((item) => item.name);
            setFilteredParticulars(filtered);
        } else {
            setFilteredParticulars([]);
        }
    }, [selectedAccount]);
    React.useEffect(() => {
        if (data) {
            setDataToUpdate(data[0]);
            const filePath = data[0]?.filePath;
            const imageUrl = `${import.meta.env.VITE_API_URL}/${filePath}`;
            console.log(filePath, imageUrl)
            // Optional: only display image if it's .jpg, .jpeg, .png
            const validImage = /\.(jpg|jpeg|png)$/i.test(filePath);
            if (validImage) setImage(imageUrl);

            setLoadingImage(false);
        }
    }, [data]);
    if (loading) return <Typography>Loading...</Typography>
    if (error) return <Alert severity="error">{error}</Alert>
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <Grid container spacing={2}>
                <Grid
                    spacing={2}
                    gap={2}
                    size={{ xs: 12, md: 4 }}
                    sx={{
                        bgcolor: 'background.paper',
                        minHeight: 100,
                        boxShadow: "inset 0 -1px 0 0 rgb(0 0 0 / 8%)"
                    }}
                    component="form"
                    onSubmit={handleSubmit}
                >
                    <Typography variant="body1" color="initial">Student ID: {dataToUpdate?.student_id}</Typography>
                    <Typography variant="body1" color="initial">Name of Payor: {dataToUpdate?.fullName}</Typography>
                    <Typography variant="body1" color="initial">Reference Number: {dataToUpdate?.reference_code}</Typography>
                    {/* <Typography variant="body1" color="initial">Purpose: {dataToUpdate?.purpose}</Typography> */}
                    <Typography variant="body1" color="initial">Amount: {dataToUpdate?.amount}</Typography>
                    {data && data[0]?.status === "pending" ? (
                        <>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="account-select">Account Type</InputLabel>
                                <Select
                                    labelId="account-select"
                                    value={selectedAccount}
                                    onChange={(e) => {
                                        setSelectedAccount(e.target.value);
                                        setDataToUpdate((prev) => ({ ...prev, purpose: '' }));
                                    }}
                                    label="Account Type"
                                >
                                    <MenuItem value="REG">REG</MenuItem>
                                    <MenuItem value="IGP">IGP</MenuItem>
                                    <MenuItem value="GS">GS</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth disabled={!selectedAccount}>
                                <InputLabel id="particular-select">Particulars</InputLabel>
                                <Select
                                    labelId="particular-select"
                                    value={dataToUpdate.particulars}
                                    onChange={(e) =>
                                        setDataToUpdate((prev) => ({ ...prev, particulars: e.target.value }))
                                    }
                                    label="Particulars"
                                >
                                    {filteredParticulars.map((name) => (
                                        <MenuItem key={name} value={name}>
                                            {name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth  >
                                <TextField
                                    fullWidth
                                    type="text"
                                    name="remarks"
                                    label="Remarks"
                                    value={dataToUpdate?.remarks}
                                    onChange={(e) => setDataToUpdate((prev) => ({ ...prev, remarks: e.target.value }))}
                                />
                            </FormControl>
                            <FormControl fullWidth  >
                                <TextField
                                    fullWidth
                                    type="text"
                                    name="details"
                                    label="Details"
                                    value={dataToUpdate?.details}
                                    onChange={(e) => setDataToUpdate((prev) => ({ ...prev, details: e.target.value }))}
                                />
                            </FormControl>
                        </>
                    )
                    : (
                    <>
                        <Typography variant="body1" color="initial">Account: {dataToUpdate?.account}</Typography>
                        <Typography variant="body1" color="initial">Particulars: {dataToUpdate?.particulars}</Typography>
                        <Typography variant="body1" color="initial">Remarks: {dataToUpdate?.remarks}</Typography>
                        <Typography variant="body1" color="initial">Details: {dataToUpdate?.details}</Typography>
                    </>
                    )}
                    {data && data[0]?.status === "pending"
                        ? (
                            <FormControl fullWidth>
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
                        )
                        : <Typography variant="body1" color="initial">Status: {data && data[0]?.status?.toUpperCase()}</Typography>}
                    {data && data[0]?.status === "pending" && <Button type="submit" variant="contained" disabled={loadingForm || !dataToUpdate.account && !dataToUpdate.particulars || dataToUpdate.status === "pending"} fullWidth>{loadingForm ? "Updating..." : "Update"}</Button>}
                </Grid>

                <Grid size={{ xs: 12, md: 8 }} sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, aspectRatio: "1/1", overflow: "hidden", border: "1px dashed rgba(0, 0, 0, 0.23)" }}>
                    {image ? (
                        <img
                            src={image}
                            alt="Preview"
                            height={400}
                            width={400}
                            loading="lazy"
                            style={{
                                objectFit: "contain",
                                objectPosition: "center",
                                width: "100%",
                                height: "100%",
                                padding: "8px",
                            }}
                        />
                    ) : (
                        <Typography
                            variant="h6"
                            sx={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "text.secondary",
                            }}
                        >
                            Image Preview
                        </Typography>
                    )}
                </Grid>
            </Grid>
        </React.Suspense>
    )
}

export default React.memo(EditTransaction)