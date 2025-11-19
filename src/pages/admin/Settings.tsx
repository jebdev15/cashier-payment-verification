import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
} from "@mui/material";
// Remove QRCodeSVG import since we'll use the base64 image from API
import { axiosInstanceWithAuthorization } from "@/api/app";
import { useCookies } from "react-cookie";

const Settings = () => {
  const [{ accessToken }] = useCookies(["accessToken"]);
  const [twoFAEnabled, setTwoFAEnabled] = React.useState(false);
  // Store base64 QR code image instead of URI
  const [qrCodeImage, setQrCodeImage] = React.useState<string | null>(null);
  const [secret, setSecret] = React.useState<string | null>(null);
  const [verificationCode, setVerificationCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Fetch current 2FA status on mount
  React.useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const res = await axiosInstanceWithAuthorization(accessToken).get("/api/settings/2fa/status");
        if (res.status === 200 && res.data.success) {
          setTwoFAEnabled(res.data.data?.enabled || false);
        }
      } catch (err) {
        console.error("Failed to fetch 2FA status", err);
      }
    };
    fetch2FAStatus();
  }, [accessToken]);

  const handleEnable2FA = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axiosInstanceWithAuthorization(accessToken).post("/api/settings/2fa/setup");
      if (res.status === 200) {
        const { secret: newSecret, qrCode, manualEntry } = res.data.data;
        setSecret(newSecret || manualEntry);
        setQrCodeImage(qrCode);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to enable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode) {
      setError("Please enter the verification code from your authenticator app.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axiosInstanceWithAuthorization(accessToken).post("/api/settings/2fa/enable", {
        token: verificationCode,
      });
      if (res.status === 200) {
        setTwoFAEnabled(true);
        setSuccess("2FA enabled successfully!");
        setQrCodeImage(null);
        setSecret(null);
        setVerificationCode("");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm("Are you sure you want to disable 2FA?")) return;
    
    const code = window.prompt("Enter your 2FA code to confirm:");
    if (!code) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axiosInstanceWithAuthorization(accessToken).post("/api/settings/2fa/disable", {
        token: code,
      });
      if (res.status === 200) {
        setTwoFAEnabled(false);
        setSuccess("2FA disabled successfully!");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h6" color="textSecondary" letterSpacing={3} textTransform="uppercase" mb={1}>
        Settings
      </Typography>

      <Box sx={{ bgcolor: "background.paper", borderRadius: 4, boxShadow: 2, p: 3 }}>
        <Typography variant="h6" mb={2}>
          Security
        </Typography>

        <FormControlLabel
          control={<Switch checked={twoFAEnabled} disabled />}
          label="Two-Factor Authentication (2FA)"
        />

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

        {!twoFAEnabled && !qrCodeImage && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Enable 2FA to add an extra layer of security to your account.
            </Typography>
            <Button variant="contained" onClick={handleEnable2FA} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Enable 2FA"}
            </Button>
          </Box>
        )}

        {qrCodeImage && (
          <Box sx={{ mt: 2, display: "grid", gap: 2 }}>
            <Typography variant="body2">
              Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy):
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", p: 2, bgcolor: "#fff", borderRadius: 2 }}>
              <img src={qrCodeImage} alt="2FA QR Code" style={{ width: 200, height: 200 }} />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Secret (manual entry): <strong>{secret}</strong>
            </Typography>
            <TextField
              label="Verification Code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              fullWidth
              inputProps={{ maxLength: 6 }}
            />
            <Button variant="contained" onClick={handleVerify2FA} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Verify & Enable"}
            </Button>
          </Box>
        )}

        {twoFAEnabled && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              2FA is currently enabled. You can disable it if needed.
            </Typography>
            <Button variant="outlined" color="error" onClick={handleDisable2FA} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Disable 2FA"}
            </Button>
          </Box>
        )}
      </Box>
    </>
  );
};

export default React.memo(Settings);
