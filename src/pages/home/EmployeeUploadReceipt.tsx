import React from "react";
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  OutlinedInput,
  Chip,
} from "@mui/material";
import imageCompression from "browser-image-compression";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { base64ToBlob } from "@/utils/base64ToBlog";
import { useCookies } from "react-cookie";
import { isAxiosError } from "axios";
import { useAxios } from "@/hooks/useAxios";
import SnackbarProvider from "@/components/Snackbar";
import { theme } from "@/theme/theme";
import { modeOfPaymentOptions } from "./modeOfPaymentOptions";

const UploadReceipt = () => {
  const [{ accessToken }] = useCookies(["accessToken"]);
  const [image, setImage] = React.useState<string | null>(null);
  const [imageName, setImageName] = React.useState<string | undefined>(undefined);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<{ upload: boolean }>({ upload: false });
  const [referenceId, setReferenceId] = React.useState<string>("");
  const [referenceNumber, setReferenceNumber] = React.useState<string>("");
  const [modeOfPayment, setModeOfPayment] = React.useState<string>("");
  const [remarks, setRemarks] = React.useState<string>("");
  const [selectedParticulars, setSelectedParticulars] = React.useState<string[]>([]);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "info" as "error" | "warning" | "info" | "success",
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 🧩 Fetch Particulars for employee
  const { data: particularsData } = useAxios({
    url: "/api/particulars",
    authorized: true,
  });

  const handleChangeFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        if (file.size > 2 * 1024 * 1024) {
          setError("File size exceeds 2 MB. Compressing...");
        } else {
          setError(null);
        }

        const compressedFile = await imageCompression(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result as string);
          setError(null);
        };
        reader.readAsDataURL(compressedFile);
        setImageName(file.name);
      } catch (err) {
        console.error(err);
        setError("Failed to process the image. Please try again.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading({ upload: true });

    if (!image) {
      alert("No image selected. Please upload a receipt before submitting.");
      setLoading({ upload: false });
      return;
    }

    if (selectedParticulars.length === 0) {
      alert("Please select at least one Particular.");
      setLoading({ upload: false });
      return;
    }

    try {
      const blob = base64ToBlob(image);
      const formData = new FormData();
      formData.append("receipt", blob || image, imageName);
      formData.append("remarks", remarks);
      formData.append("referenceId", referenceId);
      formData.append("referenceNumber", referenceNumber);
      formData.append("mode_of_payment", modeOfPayment);
      formData.append("particulars", JSON.stringify(selectedParticulars)); // ✅ include multiple particulars

      const { data, status } = await axiosInstanceWithAuthorization(accessToken).post(
        "/api/upload/receipts",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (status === 200) {
        setSnackbar({ open: true, message: data.message, severity: "success" });
        setReferenceId("");
        setReferenceNumber("");
        setModeOfPayment("");
        setRemarks("");
        setSelectedParticulars([]);
        setImage(null);
        setImageName(undefined);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      if (isAxiosError(error)) {
        setSnackbar({
          open: true,
          message: error.response?.data.message || "Something went wrong",
          severity: "error",
        });
      }
    } finally {
      setLoading({ upload: false });
    }
  };

  return (
    <>
      <Typography
        variant="h6"
        color="textSecondary"
        letterSpacing={3}
        textTransform="uppercase"
        mb={1}
      >
        Upload Receipt
      </Typography>

      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 4,
          boxShadow: 2,
          p: 2,
          flexGrow: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 2,
          }}
          component="form"
          onSubmit={handleSubmit}
        >
          {/* LEFT PANEL - Form */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: { xs: "100%", lg: "35%" },
            }}
          >
            <Typography variant="h6">Upload Receipt Form</Typography>
            {/* ✅ Multi-select Particulars */}
            <FormControl fullWidth>
              <InputLabel>Particulars</InputLabel>
              <Select
                multiple
                value={selectedParticulars}
                onChange={(e) => setSelectedParticulars(e.target.value as string[])}
                input={<OutlinedInput label="Particulars" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                sx={{ borderRadius: 3 }}
              >
                {(particularsData || []).map((part: any) => (
                  <MenuItem key={part.id} value={part.name}>
                    {part.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Mode of Payment */}
            <FormControl fullWidth>
              <InputLabel>Mode of Payment</InputLabel>
              <Select
                value={modeOfPayment}
                label="Mode of Payment"
                onChange={(e) => setModeOfPayment(e.target.value)}
                sx={{ borderRadius: 3 }}
              >
                {modeOfPaymentOptions.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Reference Number */}
            <FormControl fullWidth>
              <TextField
                label="Reference Number"
                fullWidth
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </FormControl>

            {/* Remarks */}
            <FormControl fullWidth>
              <TextField
                label="Remarks"
                fullWidth
                multiline
                minRows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </FormControl>

            {/* File Upload */}
            <TextField
              type="file"
              fullWidth
              onChange={handleChangeFile}
              inputRef={fileInputRef}
              inputProps={{ accept: "image/*" }}
            />

            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={!image || loading.upload}
              sx={{
                borderRadius: 3,
                bgcolor: `color-mix(in srgb, ${theme.palette.primary.main} 75%, transparent)`,
                "&:hover": {
                  bgcolor: `color-mix(in srgb, ${theme.palette.primary.main} 100%, transparent)`,
                },
              }}
            >
              {loading.upload ? "Uploading..." : "Upload File"}
            </Button>

            {error && (
              <Alert severity="warning" sx={{ mb: 2, width: "100%" }}>
                {error}
              </Alert>
            )}
          </Box>

          {/* RIGHT PANEL - Image Preview */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              bgcolor: "#f0f0f0",
              borderRadius: 3,
              p: 2,
            }}
          >
            {image ? (
              <img
                src={image}
                alt="Preview"
                style={{
                  objectFit: "contain",
                  width: "100%",
                  height: "100%",
                  padding: "8px",
                }}
              />
            ) : (
              <Typography color="text.secondary">Image Preview</Typography>
            )}
          </Box>
        </Box>
      </Box>

      <SnackbarProvider
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default UploadReceipt;
