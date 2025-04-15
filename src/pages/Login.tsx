import React from 'react'
import { Password, Person, Send } from '@mui/icons-material';
import { Box, Paper, FormControl, TextField, IconButton, Button, Typography, Tooltip } from '@mui/material'
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from 'react-router';
type LoginData = {
    email: string;
    code: string;
}
const initialLoginData: LoginData = {
    email: "",
    code: "",
};
const Login = () => {
    const navigate = useNavigate()
    const handleRedirectToRegister = () => { navigate("/register") }
    const [loginData, setLoginData] = React.useState<LoginData>(initialLoginData);
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setLoginData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }
    const recaptcha = React.useRef<ReCAPTCHA>(null);
    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("email",loginData.email)
    }
    return (
        <Paper component={Paper}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignContent: 'center',
                    gap: 2,
                    padding: 2,
                    minWidth: 500,
                    minHeight: 500
                }}
                component={"form"}
            >
                <Typography variant="h4" color="initial" align="center">LOGIN</Typography>
                <Typography variant="caption" color="initial" align="center">Not registered? Register <a style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={handleRedirectToRegister}>here</a></Typography>
                <FormControl fullWidth>
                    <TextField
                        id="outlined-basic"
                        label="Email Address"
                        name="email"
                        value={loginData.email}
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
                <FormControl fullWidth>
                    <TextField
                        id="outlined-basic"
                        label="Code"
                        name="code"
                        value={loginData.code}
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
                <Button type="submit" variant="contained">Login</Button>
            </Box>
        </Paper>
    )
}

export default React.memo(Login)