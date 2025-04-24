import React from 'react'
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material'
import { UploadFile as UploadFileIcon } from '@mui/icons-material'
import SpanningTable from './SpanningTableForUR'
import { LazyImage } from '../../components/LazyImage'
import imageCompression from 'browser-image-compression'
import { axiosInstanceWithAuthorization } from '../../api/app'
import { base64ToBlob } from '../../utils/base64ToBlog'
import { useCookies } from 'react-cookie'
import { FileUploadLogType } from '../../types/fileUpload'

const UploadReceipt = () => {
    const [{ accessToken }] = useCookies(['accessToken']);
    const [image, setImage] = React.useState<string | null>(null);
    const [imageName, setImageName] = React.useState<string | undefined>(undefined);
    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState<{ upload: boolean; log: boolean}>({ upload: false, log: false });
    const [data, setData] = React.useState<FileUploadLogType[]>([]);
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
    }
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const confirmation = window.confirm('Are you sure to proceed to the next form? You can\'t edit your image after proceeding.');
        if (!confirmation) return;

        setLoading((prevState) => ({ ...prevState, upload: true, log: true }));

        const formData = new FormData();

        // Check if image exists and is in base64 format
        if (image) {
            // Convert the base64 image to a Blob (if necessary)
            const blob = base64ToBlob(image);
            // Append the Blob or File directly (no need to convert if it's already a File)
            formData.append('receipt', blob || image, imageName);  // Use the file object directly if available
            formData.append('remarks', "asd");  // Use the file object directly if available
        } else {
            alert("No image to upload. Please select a file before proceeding.");
            setLoading((prevState) => ({ ...prevState, upload: false, log: false }));
            return;
        }

        try {
            const { data, status } = await axiosInstanceWithAuthorization(accessToken).post('/api/upload/receipts', formData, { headers: { 'Content-Type': 'multipart/form-data' }, });
            alert(data.message);
            console.log(data, status);
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setLoading((prevState) => ({ ...prevState, upload: false, log: false }));
        }
    };
    React.useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        const fetchUploadReceiptLog = async () => {
            try {
                const { data, status } = await axiosInstanceWithAuthorization(accessToken).get('/api/upload/receipts', { signal });
                setData(data);
                console.log(data, status);
            } catch (error) {
                console.error("Error uploading file:", error);
            } finally {
                setLoading((prevState) => ({...prevState, log: false }));
            }
        }
        fetchUploadReceiptLog();
        return () => controller.abort();
    },[accessToken, loading.upload]);
    return (
        <Box sx={{ flexGrow: 1, paddingX: 4, paddingY: 2 }}>
            <Typography
                variant="h4"
                color="initial"
                sx={{ marginBottom: 2 }}
            >
                Upload Receipt
            </Typography>
            <Paper
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    width: "100%"
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                        height: { xs: "100%", md: 600 },
                        width: { xs: "100%", md: 600 }
                    }}
                    component="form"
                    onSubmit={handleSubmit}
                >
                    <TextField type='file' onChange={handleChangeFile} />
                    <Paper sx={{ minHeight: 400, minWidth: 400 }}>
                        {image && <LazyImage src={image} alt="Preview" height={400} width={400} />}
                    </Paper>
                    <Button variant="contained" startIcon={<UploadFileIcon />} disabled={!image || loading.upload} type="submit" sx={{ mt: 2 }}>{loading.upload ? "Uploading..." : "Upload File"}</Button>
                    {error && (
                        <Alert severity="warning" sx={{ mb: 2, maxWidth: 400 }}>
                        {error}
                        </Alert>
                    )}
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                        height: { xs: "100%", md: 500 },
                        width: { xs: "100%", md: 400 },
                    }}
                >
                    <SpanningTable data={data} loading={loading.log} />
                </Box>
            </Paper>
        </Box>
    )
}

export default UploadReceipt