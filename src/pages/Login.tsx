import React from "react";
import { Login as LoginIcon, Send as SendIcon, Person as PersonIcon, Password as PasswordIcon } from "@mui/icons-material";
import { Box, FormControl, TextField, Button, Typography, Tooltip, CircularProgress } from "@mui/material";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate } from "react-router";
import { isAxiosError } from "axios";
import { axiosInstance } from "../api/app";
import { useCookies } from "react-cookie";
import SnackbarProvider from "../components/Snackbar";
type LoginData = {
  email: string;
  code: string;
};
const initialLoginData: LoginData = {
  email: "",
  code: "",
};

type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info" | undefined;
}

const Login = () => {
  const [, setCookie] = useCookies(["accessToken"]);
  const navigate = useNavigate();
  const handleRedirectToRegister = () => navigate("/register");
  const [loginData, setLoginData] = React.useState<LoginData>(initialLoginData);
  const [recaptchaValue, setRecaptchaValue] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<{ loginForm: boolean; sendCode: boolean }>({ loginForm: false, sendCode: false });
  const [snackbar, setSnackbar] = React.useState<SnackbarState>({ open: false, message: "", severity: undefined });
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const recaptcha = React.useRef<ReCAPTCHA>(null);
  const handleSendEmail = async () => {
    setLoading((prevState) => ({ ...prevState, sendCode: true }));
    const formData = new FormData();
    formData.append("email", loginData.email);
    formData.append("code", loginData.code);
    formData.append("purpose", "login");
    try {
      const { data } = await axiosInstance.post("/api/auth/generate-code", formData);
      setSnackbar((prev) => ({ ...prev, message: data.message, severity: 'success' }));
    } catch (error) {
      if (isAxiosError(error)) {
        setSnackbar((prev) => ({ ...prev, message: error.response?.data.message || "Something went wrong", severity: 'error' }));
      }
    } finally {
      setSnackbar((prev) => ({ ...prev, open: true }));
      setLoading((prevState) => ({ ...prevState, sendCode: false }));
    }
  };
  const onChangeRecaptcha = (value: string | null) => {
    setRecaptchaValue(value);
  };
  const handleRedirectToHome = (token: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setCookie("accessToken", token, {
          path: "/",
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // 1 day
        });
        navigate("/home", { replace: true });
        resolve();
      }, 1000);
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prevState) => ({ ...prevState, loginForm: true, sendCode: true }));
    const formData = new FormData();
    formData.append("email", loginData.email);
    formData.append("code", loginData.code);
    try {
      const { data } = await axiosInstance.post("/api/auth/login", formData);
      setSnackbar((prev) => ({ ...prev, message: data.message, severity: 'success' }));
      await handleRedirectToHome(data.accessToken);
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        setSnackbar((prev) => ({ ...prev, message: error.response?.data.message || "Something went wrong", severity: 'error' }));
      }
    } finally {
      setSnackbar((prev) => ({ ...prev, open: true })); 
      setLoading((prevState) => ({ ...prevState, loginForm: false, sendCode: false }));
    }
  };
  const disableLoginButton = !loginData.email || !loginData.code || !recaptchaValue || loading.loginForm;
  return (
    <React.Suspense fallback={<CircularProgress />}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignContent: "center",
          justifyContent: "center",
          gap: 2,
          width: 304,
          py: 6,
        }}
        component={"form"}
        onSubmit={handleSubmit}
      >
        <Typography variant="h4" color="primary" align="center">
          LOG-IN
        </Typography>
        <Typography variant="caption" color="initial" align="center">
          Not registered? Register{" "}
          <a style={{ textDecoration: "underline", cursor: "pointer" }} onClick={handleRedirectToRegister}>
            here
          </a>
        </Typography>
        <FormControl fullWidth>
          <TextField
            size="small"
            label="Email Address"
            name="email"
            value={loginData.email}
            onChange={handleChange}
            slotProps={{
              input: {
                sx: { input: { px: 1 } },
                startAdornment: <PersonIcon color="primary" />,
              },
            }}
            required
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField
            size="small"
            label="Authentication Code"
            name="code"
            value={loginData.code}
            onChange={handleChange}
            sx={{ "& .MuiInputBase-root": { paddingRight: 0, overflow: "hidden" } }}
            slotProps={{
              input: {
                sx: { input: { px: 1 } },
                startAdornment: <PasswordIcon color="primary" />,
                endAdornment: (
                  <Tooltip title="Send Code" arrow>
                    <span>
                      <Button
                        size="small"
                        sx={{
                          px: 1.5,
                          whiteSpace: "nowrap",
                          textTransform: "unset",
                          height: "40px",
                          borderRadius: 0,
                        }}
                        endIcon={<SendIcon />}
                        variant="contained"
                        onClick={handleSendEmail}
                        disabled={loginData.email === "" || loading.sendCode}
                      >
                        {loading.sendCode ? "Please wait..." : "Send Code"}
                      </Button>
                    </span>
                  </Tooltip>
                ),
              },
            }}
            required
          />
        </FormControl>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <ReCAPTCHA sitekey={import.meta.env.VITE_SITE_KEY} ref={recaptcha} onChange={onChangeRecaptcha} />
        </Box>
        <Button type="submit" endIcon={<LoginIcon />} variant="contained" disabled={disableLoginButton}>
          {loading.loginForm ? "Logging In..." : "Login"}
        </Button>
      </Box>
      <SnackbarProvider
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </React.Suspense>
  );
};

export default React.memo(Login);
