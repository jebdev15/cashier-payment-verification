import React from "react";
import { Alert, Box, Button, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Tooltip, Typography } from "@mui/material";
import { GeneratingTokens as GeneratingTokensIcon, UploadFile as UploadFileIcon } from "@mui/icons-material";
import imageCompression from "browser-image-compression";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { base64ToBlob } from "@/utils/base64ToBlog";
import { useCookies } from "react-cookie";
import { isAxiosError } from "axios";
import { useAxios } from "@/hooks/useAxios";

const modeOfPaymentOptions = ["Bank Deposit", "LBP LinkBiz", "LDDAP-ADA", "Bank Transfer", "GCash"];
const UploadReceipt = () => {
  const [{ accessToken }] = useCookies(["accessToken"]);
  const [image, setImage] = React.useState<string | null>(null);
  const [imageName, setImageName] = React.useState<string | undefined>(undefined);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<{ upload: boolean; generateCode: boolean }>({ upload: false, generateCode: false });
  const [referenceId, setReferenceId] = React.useState<string>("");
  const [referenceNumber, setReferenceNumber] = React.useState<string>("");
  const [modeOfPayment, setModeOfPayment] = React.useState<string>("GCash");
  const [remarks, setRemarks] = React.useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: referenceData } = useAxios({
    url: "/api/transactions/valid-reference-id",
    method: "GET",
    authorized: true
  })

  const handleGenerateReferenceId = async () => {
    setLoading((prevState) => ({ ...prevState, generateCode: true }));
    try {
      const formData = new FormData();
      formData.append("referenceNumber", referenceNumber);
      const { data: data2 } = await axiosInstanceWithAuthorization(accessToken).post(`/api/transactions/save-reference-id/External`, formData);
      setReferenceId(data2.reference_id);
    } catch (error) {
      console.error(error);
      if (isAxiosError(error)) {
        alert("An error occurred while generating the reference ID.");
      }
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
      alert(data.message);
      if (status === 200) {
        setReferenceId("");
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
        if (error.request) return alert(error.request.response);
        if (error.response) return alert(error.response.data.message);
      }
    } finally {
      setLoading((prevState) => ({ ...prevState, upload: false, log: false }));
    }
  };
  React.useEffect(() => {
    setReferenceId(referenceData?.reference_id)
  }, [referenceData])
  return (
    <Box sx={{ height: "100%", flexGrow: 1 }}>
      <Typography variant="h4" color="initial" sx={{ marginBottom: 4 }}>
        Upload Receipt
      </Typography>
      <Grid container spacing={4} sx={{ height: "100%" }} component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2} direction="column" size={{ xs: 12, lg: 4 }}>


          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <TextField
                sx={{ "& .MuiInputBase-root": { paddingRight: 0, overflow: "hidden" } }}
                slotProps={{
                  input: {
                    sx: { borderRadius: 2, input: { px: 1 } },
                    endAdornment: (
                      <Tooltip title="Generate Reference ID" placement="top">
                        <IconButton
                          size="small"
                          onClick={handleGenerateReferenceId}>
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
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Mode of Payment</InputLabel>
              <Select sx={{ borderRadius: 2 }} labelId="demo-simple-select-label" id="demo-simple-select" value={modeOfPayment} label="Mode of Payment" onChange={(e) => setModeOfPayment(e.target.value)}>
                {modeOfPaymentOptions.map((option, index) => (
                  <MenuItem key={++index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth>
              <TextField
                sx={{ "& .MuiInputBase-root": { paddingRight: 0, overflow: "hidden" } }}
                slotProps={{
                  input: {
                    sx: { borderRadius: 2, input: { px: 1 } },
                  },
                }}
                label="Reference Number"
                onChange={(e) => setReferenceNumber(e.target.value)}
                value={referenceNumber}
              />
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }} sx={{ display: "none" }}>
            <FormControl fullWidth>
              <TextField
                slotProps={{
                  input: {
                    sx: { borderRadius: 2 },
                  },
                }}
                label="Remarks"
                value={remarks}
                multiline
                rows={4}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              type="file"
              onChange={handleChangeFile}
              inputRef={fileInputRef}
              slotProps={{
                htmlInput: { accept: "image/*" },
                input: {
                  sx: { borderRadius: 2 },
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button sx={{ borderRadius: 2 }} variant="contained" startIcon={<UploadFileIcon />} disabled={!image || loading.upload} type="submit" fullWidth size="large">
              {loading.upload ? "Uploading..." : "Upload File"}
            </Button>
            {error && (
              <Alert severity="warning" sx={{ mb: 2, width: "100%" }}>
                {error}
              </Alert>
            )}
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Grid size={{ xs: 12 }} sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, aspectRatio: "1/1", overflow: "hidden", border: "1px dashed rgba(0, 0, 0, 0.23)" }}>
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
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UploadReceipt;