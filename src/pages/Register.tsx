import React from 'react'
import { Box, Paper, FormControl, TextField, IconButton, Button, Typography, Tooltip, Select, SelectChangeEvent, MenuItem } from '@mui/material'
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from 'react-router';
import { axiosInstance } from '../api/app';
import { isAxiosError } from 'axios';
type RegisterDataType = {
    userType: string;
    studentId: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    code: string;
}
const initialregisterData: RegisterDataType = {
    userType: "Student",
    studentId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    code: "",
};

const userTypeOptions = ["Student"];

const Register = () => {
    const navigate = useNavigate()
    const handleRedirectToLogin = () => { navigate("/") }
    const [registerData, setRegisterData] = React.useState<RegisterDataType>(initialregisterData);
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setRegisterData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }
    const [loading, setLoading] = React.useState<{ registrationForm: boolean, sendCode: boolean }>({ registrationForm: false, sendCode: false });
    const recaptcha = React.useRef<ReCAPTCHA>(null);
    const handleSendEmail = async () => {
        if(registerData.email === "") return alert("Email is required");
        setLoading((prevState) => ({ ...prevState, sendCode: true }));
        const formData = new FormData();
        formData.append("email", registerData.email);
        formData.append("purpose", "registration");
        try {
            const { data } = await axiosInstance.post("/api/auth/generate-code", formData);
            alert(data.message);
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.request) return alert(error.request.response)
                if (error.response) return alert(error.response.data)
            }
            alert("Something went wrong")
        } finally {
            setLoading((prevState) => ({ ...prevState, sendCode: false }));
        }
    }
    const handleChangeSelect = (event: SelectChangeEvent<string>) => {
        setRegisterData((prevData) => ({
            ...prevData,
            userType: event.target.value,
        }));
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading((prevState) => ({ ...prevState, registrationForm: true }));
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        try {
            const { data } = await axiosInstance.post("/api/auth/register", formData);
            alert(data.message);
        } catch (error) {
            console.error(error);
            if (isAxiosError(error)) {
                if (error.request) return alert(JSON.parse(error.request.response.toString()).message)
                if (error.response) return alert(JSON.parse(error.response.data.toString()).message)
            }
            alert("Server is busy, please try again later")
        } finally {
            setLoading((prevState) => ({ ...prevState, registrationForm: false }));
        }
    }

    const disableButton = registerData.code === "" || registerData.email === "" || registerData.firstName === "" || registerData.lastName === "" || registerData.studentId === "" || registerData.middleName === "" || loading.registrationForm;
    return (
        <Paper component={Paper}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 2,
                    padding: 2,
                    minWidth: 500,
                    minHeight: 500
                }}
                component={"form"}
                onSubmit={handleSubmit}
            >
                <Typography variant="h4" color="initial" align="center">REGISTRATION FORM</Typography>
                <Typography variant="caption" color="initial" align="center">Already registered? Login <a style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={handleRedirectToLogin}>here</a></Typography>
                {/* User Type */}
                <FormControl fullWidth>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={registerData.userType}
                        label="User Type"
                        name="userType"
                        onChange={handleChangeSelect}
                        required
                    >
                        {userTypeOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* Student ID */}
                {registerData.userType === "Student" && (
                    <FormControl fullWidth>
                        <TextField
                            label="Student ID"
                            name="studentId"
                            value={registerData.studentId}
                            onChange={handleChange}
                            required={registerData.userType === "Student"}
                        />
                    </FormControl>
                )}
                {/* First Name */}
                <FormControl fullWidth>
                    <TextField
                        
                        label="First Name"
                        name="firstName"
                        value={registerData.firstName}
                        onChange={handleChange}
                        required
                    />
                </FormControl>
                {/* Middle Name */}
                <FormControl fullWidth>
                    <TextField
                        
                        label="Middle Name"
                        name="middleName"
                        value={registerData.middleName}
                        onChange={handleChange}
                    />
                </FormControl>
                {/* Last Name */}
                <FormControl fullWidth>
                    <TextField
                        
                        label="Last Name"
                        name="lastName"
                        value={registerData.lastName}
                        onChange={handleChange}
                        required
                    />
                </FormControl>
                {/* Email Address */}
                <FormControl fullWidth>
                    <TextField
                        label="Email Address"
                        name="email"
                        value={registerData.email}
                        onChange={handleChange}
                        required
                    />
                </FormControl>
                {/* Code */}
                <FormControl fullWidth>
                    <TextField
                        label="Verification Code"
                        name="code"
                        value={registerData.code}
                        onChange={handleChange}
                        slotProps={{
                            input: {
                                endAdornment:
                                    <Tooltip title="Send Code" arrow>
                                        <IconButton onClick={handleSendEmail} disabled={registerData.email === ""}>
                                            {/* */}
                                            <Typography variant="body1" color="initial">Send verification code</Typography>
                                        </IconButton>
                                    </Tooltip>
                            }
                        }}
                        required
                    />
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ReCAPTCHA sitekey={import.meta.env.VITE_SITE_KEY} ref={recaptcha} />
                </Box>
                <Button type="submit" variant="contained" disabled={disableButton}>{loading.registrationForm ? "Registering..." : "Register"}</Button>
            </Box>
        </Paper>
    )
}

export default React.memo(Register)