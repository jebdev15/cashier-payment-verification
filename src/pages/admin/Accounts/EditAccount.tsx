import React from 'react'
import { Box, Button, FormControl, MenuItem, Select, TextField, Typography } from '@mui/material'
import { axiosInstance } from '../../../api/app';
import { isAxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router';
import { AccountDataType } from './type';


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
        status: ""
    });
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading((prevState) => ({...prevState, form: true }));
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
    React.useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        const fetchUser = async () => {
            setLoading((prevState) => ({...prevState, fetch: true }));
            try {
                const { data } = await axiosInstance.get(`/api/users/${id}`, { signal });
                setDataToUpdate(data[0]);
            } catch (error) {
                if (signal.aborted) return;
                if (isAxiosError(error)) {
                    if (error.request) return alert(error.request.response["message"]);
                    if (error.response) return alert(error.response.data.message);
                }
            } finally {
                setLoading((prevState) => ({...prevState, fetch: false }));
            }
        }
        fetchUser();
        return () => controller.abort();
    }, [id])
    if (loading.fetch) return <div>Loading...</div>
    return (
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
                    <Select
                        value={dataToUpdate.status}
                        label="Status"
                        name="status"
                        onChange={(e) => setDataToUpdate((prev) => ({ ...prev, status: e.target.value }))}
                    >
                        <MenuItem value={"approved"}>Approved</MenuItem>
                        <MenuItem value={"rejected"}>Rejected</MenuItem>
                    </Select>
                </FormControl>
                <Button type="submit" variant="contained" disabled={loading.form}>{loading.form ? "Updating..." : "Update"}</Button>
            </Box>
        </Box>
    )
}

export default React.memo(EditAccount)