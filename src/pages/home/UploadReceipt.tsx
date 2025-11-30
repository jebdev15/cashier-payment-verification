// ...existing code...
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
  SelectChangeEvent,
  Tooltip,
  Grid,
  Stack,
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
// ...existing code...

type ParticularType = {
  account_title: string;
  collection_type_name: string;
  implementing_unit_title: string;
  item_abbreviation: string;
  item_title: string;
  nature_of_collection_id: number;
  nature_of_collection_type: number;
};

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
  const [selectedParticulars, setSelectedParticulars] = React.useState<number[]>([]);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "info" as "error" | "warning" | "info" | "success",
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: particularsData } = useAxios<ParticularType[]>({
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

  const handleParticularsChange = (event: SelectChangeEvent<number[]>) => {
    const value = event.target.value;
    setSelectedParticulars(typeof value === "string" ? [] : value);
  };

  const getParticularLabel = (id: number): string => {
    const particular = particularsData?.find((p) => p.nature_of_collection_id === id);
    return particular
      ? particular.item_title
      : String(id);
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
      formData.append("modeOfPayment", modeOfPayment);
      formData.append("particulars", JSON.stringify(selectedParticulars));

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

  // Compute dynamic label for reference field based on mode of payment
  const referenceLabel = React.useMemo(() => {
    const m = (modeOfPayment || "").toLowerCase();
    if (m.includes("lddap") || m.includes("lddap-ada")) return "ADA/Check No.";
    if (m.includes("check") || m.includes("direct bank deposit - check")) return "Check Number";
    return "Reference Number";
  }, [modeOfPayment]);

  return (
    <>
      <Typography
        variant="h6"
        color="textSecondary"
        letterSpacing={3}
        textTransform="uppercase"
        mb={1}
      >
        Upload Receipt Form
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
        {/* Use Grid for responsive layout: stack on xs, columns on md+ */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* LEFT PANEL - Form */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2}>
                {/* <Typography variant="h6">Upload Receipt </Typography> */}

                <FormControl fullWidth>
                  <InputLabel>Particulars</InputLabel>
                  <Select
                    multiple
                    value={selectedParticulars}
                    onChange={handleParticularsChange}
                    input={<OutlinedInput label="Particulars" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((id) => {
                          const label = getParticularLabel(id);
                          return (
                            <Tooltip key={id} title={label}>
                              <Chip
                                label={label}
                                size="small"
                                sx={{
                                  // maxWidth: { xs: 120, sm: 160 },
                                  height: "auto !important",
                                  lineHeight: "normal !important",
                                  py: 1,
                                  "& .MuiChip-label": {
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "normal !important",
                                  },
                                }}
                              />
                            </Tooltip>
                          );
                        })}
                      </Box>
                    )}
                    MenuProps={{
                      PaperProps: { style: { maxHeight: 320 } },
                    }}
                    inputProps={{
                      sx: {
                        whiteSpace: "normal !important",
                      },
                    }}
                    sx={{ borderRadius: 3 }}
                  >
                    {(particularsData || []).map((particular) => (
                      <MenuItem
                        key={particular.nature_of_collection_id}
                        value={particular.nature_of_collection_id}
                        sx={{
                          alignItems: "flex-start",
                          py: 1,
                          whiteSpace: "normal !important",
                        }}
                      >
                        <Box sx={{ width: "100%" }}>
                          <Tooltip title={`${particular.item_title} • ${particular.account_title}`}>
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              // noWrap
                              sx={{ maxWidth: "100%", display: "block" }}
                            >
                              {particular.item_title}
                            </Typography>
                          </Tooltip>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            {particular.collection_type_name} • {particular.account_title}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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

                {/* Reference field uses dynamic label but keeps same referenceNumber state */}
                <TextField
                  label={referenceLabel}
                  fullWidth
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  slotProps={{ htmlInput: { maxLength: 64 } }}
                />

                <TextField
                  label="Remarks"
                  fullWidth
                  multiline
                  minRows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />

                <TextField
                  type="file"
                  fullWidth
                  onChange={handleChangeFile}
                  inputRef={fileInputRef}
                  slotProps={{
                    htmlInput: {
                      accept: "image/*"
                    }
                  }}
                />

                <Button
                  variant="contained"
                  type="submit"
                  fullWidth
                  disabled={!image || loading.upload || !referenceNumber || !modeOfPayment || selectedParticulars.length === 0}
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
              </Stack>
            </Grid>

            {/* RIGHT PANEL - Image Preview */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor: "#f7f7f7",
                  borderRadius: 3,
                  p: 1,
                  overflow: "hidden",
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
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <Typography color="text.secondary" textAlign="center" sx={{ px: 2 }}>
                    Image Preview
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
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