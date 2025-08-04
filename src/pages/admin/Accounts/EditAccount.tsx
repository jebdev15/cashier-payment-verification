import React from 'react'
import { isAxiosError } from 'axios';
import { axiosInstance } from '@/api/app';
import { Alert, Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router';
import { AccountDataType } from './type';
import { useAxios } from '@/hooks/useAxios';
import { useFeatureStateSnackbar } from '@/hooks/useFeatureState';
import SnackbarProvider from '@/components/Snackbar';
import { ArrowBack } from '@mui/icons-material';


const EditAccount = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = React.useState<{ form: boolean; fetch: boolean }>({ form: false, fetch: false });
    const [dataToUpdate, setDataToUpdate] = React.useState<AccountDataType>({
        id: 0,
        user_id: 0,
        college: "",
        program: "",
        yearLevel: "",
        payor_name: "",
        student_id: "",
        email: "",
        firstName: "",
        middleName: "",
        lastName: "",
        status: "pending",
        userType: "",
    });
    const [snackbar, setSnackbar] = useFeatureStateSnackbar();
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading((prevState) => ({ ...prevState, form: true }));
        const formData = new FormData(event.currentTarget);
        try {
            const { data, status } = await axiosInstance.put(`/api/users/${dataToUpdate.id}`, formData);
            setSnackbar((prev) => ({ ...prev, message: data.message, severity: status === 200 ? "success" : 'info' }));
            if (!data) return;
            navigate("/admin/accounts", { replace: true });
        } catch (error) {
            if (isAxiosError(error)) {
                setSnackbar((prev) => ({ ...prev, message: error.request?.response.message || error.response?.data.message || "Something went wrong", severity: 'error' }));
            }
        } finally {
            setSnackbar((prev) => ({ ...prev, open: true }));
            setLoading((prevState) => ({ ...prevState, form: false }));
        }
    }
    const { data, loading: loadingData, error } = useAxios({
        url: `/api/users/${id}`,
        authorized: false,
    })
    React.useEffect(() => {
        if (!data) return;
        setDataToUpdate(data);
    }, [data])
    if (loadingData) return <CircularProgress />
    if (error) return <Alert severity="error">{error}</Alert>
    return (
        <React.Suspense fallback={<CircularProgress />}>
            {
                (!loadingData && (data?.status === "approved" || data?.status === "rejected"))
                    ? (
                        <Paper
                            elevation={3}
                            sx={{
                                p: 4,
                                mx: 'auto',
                                mt: 3,
                                maxWidth: 700,
                                backgroundColor: '#fdfdfd',
                                borderRadius: 3,
                            }}
                        >
                            <Button variant="contained" sx={{ mb: 2 }} onClick={() => navigate("/admin/accounts", { replace: true })} startIcon={<ArrowBack />}>Back</Button>
                            <Typography variant="h5" fontWeight={600} gutterBottom>
                                User Account Details
                            </Typography>

                            <Box
                                component="dl"
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: '150px 1fr' },
                                    rowGap: 2,
                                    columnGap: 3,
                                    mt: 2,
                                }}
                            >
                                <Typography component="dt" fontWeight={500}>Student ID</Typography>
                                <Typography component="dd">{data?.student_id}</Typography>

                                <Typography component="dt" fontWeight={500}>Email Address</Typography>
                                <Typography component="dd">{data?.email}</Typography>

                                <Typography component="dt" fontWeight={500}>Name</Typography>
                                <Typography component="dd">
                                    {`${data?.lastName.toUpperCase()}, ${data?.firstName} ${data?.middleName}`}
                                </Typography>

                                <Typography component="dt" fontWeight={500}>College</Typography>
                                <Typography component="dd">{data?.college?.toUpperCase()}</Typography>

                                <Typography component="dt" fontWeight={500}>Program</Typography>
                                <Typography component="dd">{data?.program?.toUpperCase()}</Typography>

                                <Typography component="dt" fontWeight={500}>Year Level</Typography>
                                <Typography component="dd">{data?.yearLevel}</Typography>

                                <Typography component="dt" fontWeight={500}>User Type</Typography>
                                <Typography component="dd">{data?.userType}</Typography>

                                <Typography component="dt" fontWeight={500}>Status</Typography>
                                <Typography component="dd" sx={{ textTransform: 'capitalize' }}>
                                    {data?.status}
                                </Typography>
                            </Box>
                        </Paper>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 4,
                                    borderRadius: 3,
                                    width: '100%',
                                    maxWidth: 600,
                                    backgroundColor: '#ffffff',
                                }}
                                component="form"
                                onSubmit={handleSubmit}
                            >
                                <Typography variant="h5" fontWeight={600} mb={3}>
                                    Edit Account
                                </Typography>
                                {data?.userType === "Student" && (
                                    <Box display="flex" flexDirection="column" gap={2}>
                                        <TextField
                                            fullWidth
                                            label="Student ID"
                                            variant="outlined"
                                            name="student_id"
                                            value={dataToUpdate.student_id}
                                            onChange={(e) => setDataToUpdate((prev) => ({ ...prev, student_id: e.target.value }))}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Email Address"
                                            variant="outlined"
                                            name="email"
                                            value={dataToUpdate.email}
                                            onChange={(e) => setDataToUpdate((prev) => ({ ...prev, email: e.target.value }))}
                                        />
                                        <TextField
                                            fullWidth
                                            label="First Name"
                                            variant="outlined"
                                            name="firstName"
                                            value={dataToUpdate.firstName}
                                            onChange={(e) => setDataToUpdate((prev) => ({ ...prev, firstName: e.target.value }))}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Middle Name"
                                            variant="outlined"
                                            name="middleName"
                                            value={dataToUpdate.middleName}
                                            onChange={(e) => setDataToUpdate((prev) => ({ ...prev, middleName: e.target.value }))}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Last Name"
                                            variant="outlined"
                                            name="lastName"
                                            value={dataToUpdate.lastName}
                                            onChange={(e) => setDataToUpdate((prev) => ({ ...prev, lastName: e.target.value }))}
                                        />
                                        <TextField
                                            fullWidth
                                            label="College"
                                            variant="outlined"
                                            name="college"
                                            value={dataToUpdate.college}
                                            onChange={(e) => setDataToUpdate((prev) => ({ ...prev, college: e.target.value }))}
                                        />

                                        <TextField
                                            fullWidth
                                            label="Program"
                                            variant="outlined"
                                            name="program"
                                            value={dataToUpdate.program}
                                            onChange={(e) => setDataToUpdate((prev) => ({ ...prev, program: e.target.value }))}
                                        />
                                        <FormControl fullWidth>
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                value={dataToUpdate.status}
                                                label="Status"
                                                name="status"
                                                onChange={(e) => setDataToUpdate((prev) => ({ ...prev, status: e.target.value }))}
                                                disabled={data && data?.status === "approved"}
                                            >
                                                <MenuItem value="pending">Pending</MenuItem>
                                                <MenuItem value="approved">Approve</MenuItem>
                                                <MenuItem value="rejected">Reject</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="success"
                                            disabled={loading.form || dataToUpdate.status === "pending"}
                                            sx={{ mt: 2, py: 1.5, fontWeight: 600 }}
                                        >
                                            {loading.form ? "Updating..." : "Update"}
                                        </Button>
                                    </Box>
                                )}
                                {data?.userType === "External" && (
                                    <Box display="flex" flexDirection="column" gap={2}>
                                        <TextField
                                            fullWidth
                                            label="Name of Institution/Agency"
                                            variant="outlined"
                                            name="payor_name"
                                            value={dataToUpdate.payor_name}
                                            onChange={(e) => setDataToUpdate((prev) => ({ ...prev, payor_name: e.target.value }))}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Email Address"
                                            variant="outlined"
                                            name="email"
                                            value={dataToUpdate.email}
                                            onChange={(e) => setDataToUpdate((prev) => ({ ...prev, email: e.target.value }))}
                                        />
                                        <FormControl fullWidth>
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                value={dataToUpdate.status}
                                                label="Status"
                                                name="status"
                                                onChange={(e) => setDataToUpdate((prev) => ({ ...prev, status: e.target.value }))}
                                                disabled={data && data?.status === "approved"}
                                            >
                                                <MenuItem value="pending">Pending</MenuItem>
                                                <MenuItem value="approved">Approve</MenuItem>
                                                <MenuItem value="rejected">Reject</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="success"
                                            disabled={loading.form || dataToUpdate.status === "pending"}
                                            sx={{ mt: 2, py: 1.5, fontWeight: 600 }}
                                        >
                                            {loading.form ? "Updating..." : "Update"}
                                        </Button>
                                    </Box>
                                )}
                            </Paper>
                        </Box>
                    )}
            <SnackbarProvider
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            />
        </React.Suspense>
    )
}

export default React.memo(EditAccount)