import React from 'react'
import { Alert, Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material'
import { axiosInstance } from '../../../api/app';
import { isAxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router';
import { AccountDataType } from './type';
import { useAxios } from '../../../hooks/useAxios';


const EditAccount = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = React.useState<{ form: boolean; fetch: boolean }>({ form: false, fetch: false });
    const [dataToUpdate, setDataToUpdate] = React.useState<AccountDataType>({
        id: 0,
        student_id: "",
        email: "",
        firstName: "",
        middleName: "",
        lastName: "",
        status: "approved"
    });
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading((prevState) => ({ ...prevState, form: true }));
        const formData = new FormData(event.currentTarget);
        try {
            const { data } = await axiosInstance.put(`/api/users/${dataToUpdate.id}`, formData);
            if (!data) return;
            alert(data.message);
            navigate("/admin/accounts", { replace: true });
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.request) return alert(JSON.parse(error.request.toString()).message);
                if (error.response) return alert(JSON.parse(error.response.toString()).message);
            }
        } finally {
            setLoading((prevState) => ({ ...prevState, form: false }));
        }
    }
    const { data, loading: loadingData, error } = useAxios({
        url: `/api/users/${id}`,
        authorized: false,
    })
    React.useEffect(() => {
        if (!data) return;
        setDataToUpdate(data[0]);
    }, [data])
    if (loadingData) return <CircularProgress />
    if (error) return <Alert severity="error">{error}</Alert>
    return (
        (data && data[0].status === "approved")
            ? (
                <Box sx={{ flexGrow: 1, paddingLeft: 5 }}>
                    <Typography variant="h4" color="initial">View Account</Typography>

                    <Typography variant="body1" color="initial">Student ID: {data[0].student_id}</Typography>
                    <Typography variant="body1" color="initial">Email Address: {data[0].email}</Typography>
                    <Typography variant="body1" color="initial">Name: {`${data[0].lastName.toUpperCase()}, ${data[0].firstName} ${data[0].middleName.toLowerCase()}`} </Typography>
                    <Typography variant="body1" color="initial">College: {data[0].college.toUpperCase()}</Typography>
                    <Typography variant="body1" color="initial">College: {data[0].program.toUpperCase()}</Typography>
                    <Typography variant="body1" color="initial">Year Level: {data[0].yearLevel}</Typography>
                    <Typography variant="body1" color="initial">User Type: {data[0].userType}</Typography>
                    <Typography variant="body1" color="initial">Current Status: {data[0].status.toUpperCase()}</Typography>
                </Box>
            ) : (
                <Box sx={{ flexGrow: 1, paddingLeft: 5 }}>
                    <Typography variant="h4" color="initial">Edit Account</Typography>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            height: "100%",
                            width: "100%",
                            bgcolor: "#f5f5f5"
                        }}
                        component="form"
                        onSubmit={handleSubmit}
                    >
                        <FormControl fullWidth>
                            <TextField
                                label="Student ID"
                                variant="outlined"
                                name="student_id"
                                value={dataToUpdate.student_id}
                                onChange={(e) => setDataToUpdate((prev) => ({ ...prev, student_id: e.target.value }))}
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <TextField
                                label="Email Address"
                                variant="outlined"
                                name="email"
                                value={dataToUpdate.email}
                                onChange={(e) => setDataToUpdate((prev) => ({ ...prev, email: e.target.value }))}
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <TextField
                                label="First Name"
                                variant="outlined"
                                name="firstName"
                                value={dataToUpdate.firstName}
                                onChange={(e) => setDataToUpdate((prev) => ({ ...prev, firstName: e.target.value }))}
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <TextField
                                label="Middle Name"
                                variant="outlined"
                                name="middleName"
                                value={dataToUpdate.middleName}
                                onChange={(e) => setDataToUpdate((prev) => ({ ...prev, middleName: e.target.value }))}
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <TextField
                                label="Last Name"
                                variant="outlined"
                                name="lastName"
                                value={dataToUpdate.lastName}
                                onChange={(e) => setDataToUpdate((prev) => ({ ...prev, lastName: e.target.value }))}
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={dataToUpdate.status}
                                label="Status"
                                name="status"
                                onChange={(e) => setDataToUpdate((prev) => ({ ...prev, status: e.target.value }))}
                                disabled={data && data[0]?.status === "approved"}
                            >
                                <MenuItem value={"pending"}>Pending</MenuItem>
                                <MenuItem value={"approved"}>Approve</MenuItem>
                                <MenuItem value={"rejected"}>Reject</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading.form || dataToUpdate.status === "pending"}
                        >
                            {loading.form ? "Updating..." : "Update"}
                        </Button>
                    </Box>
                </Box>
            )
    )
}

export default React.memo(EditAccount)