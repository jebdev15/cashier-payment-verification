import React from "react";
import { Alert, Box, Button, FormControl, FormLabel, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material";
import { GeneratingTokens as GeneratingTokensIcon } from "@mui/icons-material";
import imageCompression from "browser-image-compression";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { base64ToBlob } from "@/utils/base64ToBlog";
import { useCookies } from "react-cookie";
import { isAxiosError } from "axios";
import { useAxios } from "@/hooks/useAxios";
import SnackbarProvider from "@/components/Snackbar";
import { theme } from "@/theme/theme";

const modeOfPaymentOptions = ["Bank Deposit", "LBP LinkBiz", "LDDAP-ADA", "Bank Transfer", "GCash"];
const UploadReceipt = () => {
  const [{ accessToken }] = useCookies(["accessToken"]);
  const [image, setImage] = React.useState<string | null>(null);
  const [imageName, setImageName] = React.useState<string | undefined>(undefined);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<{ upload: boolean; generateCode: boolean }>({ upload: false, generateCode: false });
  const [referenceId, setReferenceId] = React.useState<string>("");
  const [referenceNumber, setReferenceNumber] = React.useState<string>("");
  const [modeOfPayment, setModeOfPayment] = React.useState<string>("");
  const [remarks, setRemarks] = React.useState<string>("");
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: "error" | "warning" | "info" | "success" }>({ open: false, message: "", severity: "info" });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: referenceData } = useAxios({
    url: "/api/transactions/valid-reference-id",
    method: "GET",
    authorized: true,
  });

  const handleGenerateReferenceId = async () => {
    setLoading((prevState) => ({ ...prevState, generateCode: true }));
    try {
      const { data: data2 } = await axiosInstanceWithAuthorization(accessToken).post(`/api/transactions/save-reference-id/External`);
      setReferenceId(data2.reference_id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading((prevState) => ({ ...prevState, generateCode: false }));
    }
  };
  const handleChangeFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Validate initial file size
        if (file.size > 2 * 1024 * 1024) {
          setError("File size exceeds 2 MB. Compressing...");
        } else {
          setError(null);
        }

        // Compress image
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 2, // Maximum size in MB
          maxWidthOrHeight: 1920, // Optional: maximum width or height
          useWebWorker: true, // Improves compression speed
        });

        // Read compressed image
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result as string);
          // setImage(URL.createObjectURL(file));
          setError(null); // Clear errors after successful upload
        };
        reader.readAsDataURL(compressedFile);
        setImageName(file.name);
      } catch (err) {
        console.log(err);
        setError("Failed to process the image. Please try again.");
      }
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading((prevState) => ({ ...prevState, upload: true, log: true }));

    const formData = new FormData();

    // Check if image exists and is in base64 format
    if (image) {
      // Convert the base64 image to a Blob (if necessary)
      const blob = base64ToBlob(image);
      // Append the Blob or File directly (no need to convert if it's already a File)
      formData.append("receipt", blob || image, imageName); // Use the file object directly if available
      formData.append("remarks", remarks); // Use the file object directly if available
      formData.append("referenceId", referenceId);
      formData.append("referenceNumber", referenceNumber);
      formData.append("mode_of_payment", modeOfPayment);
    } else {
      alert("No image to upload. Please select a file before proceeding.");
      setLoading((prevState) => ({ ...prevState, upload: false, log: false }));
      return;
    }

    try {
      const { data, status } = await axiosInstanceWithAuthorization(accessToken).post("/api/upload/receipts", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSnackbar((prev) => ({ ...prev, message: data.message, severity: "success" }));
      if (status === 200) {
        setReferenceId("");
        setReferenceNumber("");
        setModeOfPayment("");
        setRemarks("");
        setImage("");
        setImageName("");
        // after successful upload:
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // clears file
        }
      }
      console.log(data, status);
    } catch (error) {
      console.error("Error uploading file:", error);
      if (isAxiosError(error)) {
        setSnackbar((prev) => ({ ...prev, message: error.response?.data.message || "Something went wrong", severity: "error" }));
      }
    } finally {
      setSnackbar((prev) => ({ ...prev, open: true }));
      setLoading((prevState) => ({ ...prevState, upload: false, log: false }));
    }
  };
  React.useEffect(() => {
    setReferenceId(referenceData?.reference_id);
  }, [referenceData]);
  return (
    <>
      <Typography variant="h6" color="textSecondary" letterSpacing={3} textTransform={"uppercase"} mb={1}>
        Upload Receipt
      </Typography>
      <Box sx={{ bgcolor: "background.paper", borderRadius: 4, boxShadow: 2, p: 2, flexGrow: 1 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 2, height: "100%", width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              height: "fit-content",
              columnGap: 2,
              width: { xs: "100%", lg: "30%" },
              minWidth: { xs: "100%", lg: "275px" },
              position: { xs: "relative", lg: "sticky" },
              top: { xs: "0", lg: "calc(72px + 1rem)" },
            }}
            component={"form"}
            onSubmit={handleSubmit}
          >
            <Typography variant="h6" mb={2}>
              Upload Receipt Form
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                height: "fit-content",
                gap: 2,
                width: "100%",
              }}
            >
              
              <FormControl fullWidth>
                <TextField
                  sx={{ "& .MuiInputBase-root": { paddingRight: 0, overflow: "hidden" } }}
                  slotProps={{
                    input: {
                      sx: { borderRadius: 3, input: { px: 1 } },
                      endAdornment: (
                        <Tooltip title="Generate Reference ID" placement="top">
                          <IconButton size="small" onClick={handleGenerateReferenceId}>
                            <GeneratingTokensIcon />
                          </IconButton>
                        </Tooltip>
                      ),
                    },
                  }}
                  label="Reference ID"
                  value={referenceId}
                  disabled
                />
                {referenceId === "" && (
                  <FormLabel>
                    <Alert severity="info">Please generate a reference ID first before uploading a receipt.</Alert>
                  </FormLabel>
                )}
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Mode of Payment</InputLabel>
                <Select sx={{ borderRadius: 3 }} labelId="demo-simple-select-label" id="demo-simple-select" value={modeOfPayment} label="Mode of Payment" onChange={(e) => setModeOfPayment(e.target.value)}>
                  {modeOfPaymentOptions.map((option, index) => (
                    <MenuItem key={++index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  sx={{ "& .MuiInputBase-root": { paddingRight: 0, overflow: "hidden" } }}
                  slotProps={{
                    input: {
                      sx: { borderRadius: 3, input: { px: 1 } },
                    },
                  }}
                  label="Reference Number"
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  value={referenceNumber}
                />
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  fullWidth
                  type="file"
                  onChange={handleChangeFile}
                  inputRef={fileInputRef}
                  slotProps={{
                    htmlInput: { accept: "image/*" },
                    input: {
                      sx: { borderRadius: 3 },
                    },
                  }}
                />
              </FormControl>
              <Button
                sx={{
                  borderRadius: 3,
                  bgcolor: `color-mix(in srgb, ${theme.palette.primary.main} 75%, transparent)`,
                  "&:hover": {
                    bgcolor: `color-mix(in srgb, ${theme.palette.primary.main} 100%, transparent)`,
                  },
                }}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                disabled={!image || loading.upload || !referenceId}
              >
                {loading.upload ? "Uploading..." : "Upload File"}
              </Button>
              {error && (
                <Alert severity="warning" sx={{ mb: 2, width: "100%" }}>
                  {error}
                </Alert>
              )}
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              bgcolor: "#f0f0f0",
              borderRadius: 3,
              padding: 2,
              minHeight: 150,
            }}
          >
            {image ? (
              <img
                src={image}
                alt="Preview"
                height={400}
                width={400}
                loading="lazy"
                style={{
                  objectFit: "contain",
                  objectPosition: "center",
                  width: "100%",
                  height: "100%",
                  padding: "8px",
                }}
              />
            ) : (
              <Typography
                variant="h6"
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                }}
              >
                Image Preview
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      <SnackbarProvider open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} />
    </>
  );
};

export default UploadReceipt;
