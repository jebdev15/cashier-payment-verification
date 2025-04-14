import React from 'react'
import { Box, Button, Paper, TextField, Typography } from '@mui/material'
import { UploadFile as UploadFileIcon } from '@mui/icons-material'
import SpanningTable from './SpanningTableForUR'
import { LazyImage } from '../../components/LazyImage'

const UploadReceipt = () => {
    const [file, setFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
        setFile(selectedFile);

        // If it's an image, generate preview
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            setPreviewUrl(null);
        }
        }
    }
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
                        height: {xs: "100%", md: 600}, 
                        width: {xs: "100%", md: 600} 
                    }}
                >
                    <TextField type='file' onChange={handleChangeFile} />
                    <Paper sx={{ minHeight: 400, minWidth: 400 }}>
                        {previewUrl && <LazyImage src={previewUrl} alt="Preview" height={400} width={400} />}
                    </Paper>
                    {file && <Button variant="contained" startIcon={<UploadFileIcon />}>Upload File</Button>}
                </Box>
                <Box 
                    sx={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        justifyContent: "center", 
                        alignItems: "center", 
                        gap: 2, 
                        height:  {xs: "100%", md: 500}, 
                        width:  {xs: "100%", md: 400},
                    }}
                >
                    <SpanningTable />
                </Box>
            </Paper>
        </Box>
    )
}

export default UploadReceipt