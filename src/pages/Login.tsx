import React from 'react'
import { 
    Abc as AbcIcon, 
    Person as PersonIcon, 
} from '@mui/icons-material';
import { Box, Paper, FormControl, TextField, IconButton, Button, Typography, Tooltip } from '@mui/material'
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from 'react-router';
import { isAxiosError } from 'axios';
import { axiosInstance } from '../api/app';
import { useCookies } from 'react-cookie';
type LoginData = {
    email: string;
    code: string;
}
const initialLoginData: LoginData = {
    email: "",
    code: "",
};
const Login = () => {
    const [,setCookie] = useCookies(["accessToken"])
    const navigate = useNavigate()
    const handleRedirectToRegister = () => navigate("/register")
    const [loginData, setLoginData] = React.useState<LoginData>(initialLoginData);
    const [recaptchaValue, setRecaptchaValue] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState<{ loginForm: boolean, sendCode: boolean }>({ loginForm: false, sendCode: false });
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setLoginData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }
    const recaptcha = React.useRef<ReCAPTCHA>(null);
    const handleSendEmail = async () => {
        setLoading((prevState) => ({ ...prevState, sendCode: true }));
        const formData = new FormData();
        formData.append("email", loginData.email);
        formData.append("code", loginData.code);
        formData.append("purpose", "login");
        try {
            const { data } = await axiosInstance.post("/api/auth/generate-code", formData);
            alert(data.message);
        } catch (error) {
            if(isAxiosError(error)) {
                if (error.request) return alert(JSON.parse(error.request.response.toString()).message)
                if (error.response) return alert(JSON.parse(error.response.data.toString()).message)
            }
            alert("Something went wrong")
        } finally {
            setLoading((prevState) => ({ ...prevState, sendCode: false }));
        }
    }
    const onChangeRecaptcha = (value: string | null) => {
        setRecaptchaValue(value);
    }
    const handleRedirectToHome = (accessToken: string) => {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                setCookie("accessToken", accessToken, { 
                    path: "/", 
                    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1) // 1 day 
                })
                navigate("/home", { replace: true })
                resolve()
            }, 1000)
        })
        
    } 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading((prevState) => ({ ...prevState, loginForm: true, sendCode: true }));
        const formData = new FormData();
        formData.append("email", loginData.email);
        formData.append("code", loginData.code);
        try {
            const { data, status } = await axiosInstance.post("/api/auth/login", formData);
            alert(data.message);
            if(status === 200 && data.message === "Login successful") await handleRedirectToHome(data.accessToken)
        } catch (error) {
            console.error(error);
            if(isAxiosError(error)) {
                if(error.request) return alert(error.request.response)
                if(error.response) return alert(error.response.data.message)
            }
            alert("Something went wrong")
        } finally {
            setLoading((prevState) => ({ ...prevState, loginForm: false, sendCode: false }));
        }
    }
    const disableLoginButton = !loginData.email || !loginData.code || !recaptchaValue || loading.loginForm
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
                onSubmit={handleSubmit}
            >
                <Typography variant="h4" color="initial" align="center">LOGIN</Typography>
                <Typography variant="caption" color="initial" align="center">Not registered? Register <a style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={handleRedirectToRegister}>here</a></Typography>
                <FormControl fullWidth>
                    <TextField
                        label="Email Address"
                        name="email"
                        value={loginData.email}
                        onChange={handleChange}
                        slotProps={{
                            input: {
                                startAdornment: <PersonIcon />
                            }
                        }}
                        required
                    />
                </FormControl>
                <FormControl fullWidth>
                    <TextField
                        label="Authentication Code"
                        name="code"
                        value={loginData.code}
                        onChange={handleChange}
                        slotProps={{
                            input: {
                                startAdornment: <AbcIcon />,
                                endAdornment: 
                                    <Tooltip title="Send Code" arrow>
                                        <IconButton onClick={handleSendEmail} disabled={loginData.email === "" || loading.sendCode}>
                                            <Typography variant="body1" color="initial">{ loading.sendCode ? "Please wait..." : "Send code"}</Typography>
                                        </IconButton>
                                    </Tooltip>
                            }
                        }}
                        required
                    />
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ReCAPTCHA 
                        sitekey={import.meta.env.VITE_SITE_KEY} 
                        ref={recaptcha}
                        onChange={onChangeRecaptcha}
                    />
                </Box>
                <Button 
                    type="submit" 
                    variant="contained"
                    disabled={disableLoginButton}
                >
                    { loading.loginForm ? "Logging In..." : "Login" }
                </Button>
            </Box>
        </Paper>
    )
}

export default React.memo(Login)