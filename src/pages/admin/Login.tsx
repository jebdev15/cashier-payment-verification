import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import chmsuLogo from "../../assets/chmsu.jpg";
import "../../assets/style.css";
import { GoogleLogin } from "@react-oauth/google";
import { axiosInstance } from "../../api/app";
import { useNavigate } from "react-router";
import { useCookies } from "react-cookie";
import { isAxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
type GoogleTokenPayload = {
    name?: string;
    email?: string;
    sub: string;
  };
const Login: React.FC = () => {
    const [, setCookie] = useCookies();
    const navigate = useNavigate()
    const [loading, setLoading] = React.useState<boolean>(false);
    const login = async (credentialResponse: any) => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.post('/api/auth/admin-login', { token: credentialResponse.credential });
            alert(data.message)
            if(data.isAuthenticated) {
                const decodedToken = jwtDecode<GoogleTokenPayload>(credentialResponse.credential);
                const fullName = decodedToken.name || "User";

                setCookie("accessToken", data.accessToken, { path: "/" });
                setCookie("fullName", fullName, { path: "/" });
                setTimeout(() => navigate('/admin/dashboard'), 1000);
            } 
        } catch (error) {
            if(isAxiosError(error)) {
                if (error.request) return alert(JSON.parse(error.request.response.toString()).message)
                if (error.response) return alert(JSON.parse(error.response.data.toString()).message)
            }
            alert("Something went wrong")
        } finally {
            setLoading(false);
        }
    }
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <Box 
                sx={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "center", 
                    alignItems: "center",
                    height: "100vh",
                    width: "100%"
                }}
            >
                <Container maxWidth="lg" fixed sx={{ height: "inherit" }}>
                    <Box
                        sx={{
                            height: "inherit",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Paper
                            className="signin_page"
                            sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", py: { xs: 3, sm: 5 }, px: { xs: 4, sm: 6 }, gap: { sm: 3, md: 6 } }}
                            elevation={8}
                        >
                            <Box className="signinMsg">
                                <img className="chmsuLogo" src={chmsuLogo} alt="logo" />
                                <Typography variant="h5" fontWeight={700} color="primary">
                                    Carlos Hilado<span>Memorial State University</span>
                                </Typography>
                                <Typography variant="body1" color="primary">
                                    {import.meta.env.VITE_APP_NAME}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    width: "inherit",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <Typography variant="h4" fontWeight={400} textAlign={{ xs: "center", md: "left" }} sx={{ mb: 1 }}>
                                    Sign In
                                </Typography>
                                <Typography variant="body1" fontWeight={400} textAlign={{ xs: "center", md: "left" }} sx={{ mb: 2 }}>
                                    Use your CHMSU Google Account
                                </Typography>
                                <Box
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                    className="loginForm"
                                >
                                    {
                                        loading
                                            ? <Typography>Signing you in...</Typography>
                                            : <GoogleLogin
                                                // className="googleLoginBtn" 
                                                onSuccess={login}
                                                onError={() => {
                                                    console.log('Login Failed');
                                                }}
                                            />
                                    }
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Container>
            </Box>
        </React.Suspense>
    );
};

export default Login;    