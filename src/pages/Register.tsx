import React from 'react'
import { Password, Person, Send } from '@mui/icons-material';
import { Box, Paper, FormControl, TextField, IconButton, Button, Typography, Tooltip, Select, SelectChangeEvent, MenuItem, FormControlLabel, FormLabel } from '@mui/material'
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from 'react-router';
type registerData = {
    userType: string;
    studentIdNumber: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    code: string;
}
const initialregisterData: registerData = {
    userType: "Student",
    studentIdNumber: "",
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
    const [registerData, setRegisterData] = React.useState<registerData>(initialregisterData);
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setRegisterData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }
    const recaptcha = React.useRef<ReCAPTCHA>(null);
    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("email",registerData.email)
    }
    const handleChangeSelect = (event: SelectChangeEvent<string>) => {
        setRegisterData((prevData) => ({
            ...prevData,
            userType: event.target.value,
        }));
    }
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
                            id="outlined-basic"
                            label="Student ID Number"
                            name="studentIdNumber"
                            value={registerData.studentIdNumber}
                            onChange={handleChange}
                            required={registerData.userType === "Student"}
                        />
                    </FormControl>
                )}
                {/* First Name */}
                <FormControl fullWidth>
                    <TextField
                        id="outlined-basic"
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
                        id="outlined-basic"
                        label="Middle Name"
                        name="middleName"
                        value={registerData.middleName}
                        onChange={handleChange}
                    />
                </FormControl>
                {/* Last Name */}
                <FormControl fullWidth>
                    <TextField
                        id="outlined-basic"
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
                        id="outlined-basic"
                        label="Email Address"
                        name="email"
                        value={registerData.email}
                        onChange={handleChange}
                        slotProps={{
                            input: {
                                startAdornment: <Person />,
                                endAdornment: 
                                    <Tooltip title="Send Code" arrow>
                                        <IconButton onClick={handleSendEmail}>
                                            <Send />
                                        </IconButton>
                                    </Tooltip>
                            }
                        }}
                        required
                    />
                </FormControl>
                {/* Code */}
                <FormControl fullWidth>
                    <TextField
                        id="outlined-basic"
                        label="Code"
                        name="code"
                        value={registerData.code}
                        onChange={handleChange}
                        slotProps={{
                            input: {
                                startAdornment: <Password />,
                            }
                        }}
                        required
                    />
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ReCAPTCHA sitekey={import.meta.env.VITE_SITE_KEY} ref={recaptcha}/>
                </Box>
                <Button type="submit" variant="contained">Register</Button>
            </Box>
        </Paper>
    )
}

export default React.memo(Register)