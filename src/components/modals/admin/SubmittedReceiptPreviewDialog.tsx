import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Typography,
    Box,
    CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RotateRightIcon from "@mui/icons-material/RotateRight";

type Props = {
    open: boolean;
    onClose: () => void;
    imageUrl: string | null;
    title?: string;
    referenceId?: string;
};

const SubmittedReceiptPreviewDialog: React.FC<Props> = ({
    open,
    onClose,
    imageUrl,
    title = "Submitted Receipt Preview",
    referenceId,
}) => {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    const [zoom, setZoom] = React.useState(1);
    const [rotation, setRotation] = React.useState(0);

    React.useEffect(() => {
        if (open && imageUrl) {
            setLoading(true);
            setError(false);
            setZoom(1);
            setRotation(0);
        }
    }, [open, imageUrl]);

    const handleImageLoad = () => {
        setLoading(false);
    };

    const handleImageError = () => {
        setLoading(false);
        setError(true);
    };

    const handleDownload = React.useCallback(async () => {
        if (!imageUrl) return;

        try {
            const response = await fetch(imageUrl, { mode: 'cors' });
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = referenceId 
                ? `receipt_${referenceId}.jpg` 
                : imageUrl.split('/').pop() || 'receipt.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Unable to download the receipt. Please check the file URL or CORS settings.');
        }
    }, [imageUrl, referenceId]);

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleReset = () => {
        setZoom(1);
        setRotation(0);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg" 
            fullWidth
            PaperProps={{
                sx: { height: '90vh' }
            }}
        >
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                <Typography variant="h6">{title}</Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* Toolbar */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 1, 
                px: 2, 
                py: 1,
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: 'background.paper'
            }}>
                <IconButton 
                    onClick={handleZoomOut} 
                    disabled={zoom <= 0.5}
                    size="small"
                    title="Zoom Out"
                >
                    <ZoomOutIcon />
                </IconButton>
                <Typography 
                    variant="body2" 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        minWidth: '60px',
                        justifyContent: 'center'
                    }}
                >
                    {Math.round(zoom * 100)}%
                </Typography>
                <IconButton 
                    onClick={handleZoomIn} 
                    disabled={zoom >= 3}
                    size="small"
                    title="Zoom In"
                >
                    <ZoomInIcon />
                </IconButton>
                <IconButton 
                    onClick={handleRotate}
                    size="small"
                    title="Rotate 90°"
                >
                    <RotateRightIcon />
                </IconButton>
                <Button 
                    onClick={handleReset} 
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                >
                    Reset
                </Button>
                <Button 
                    onClick={handleDownload}
                    size="small"
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    sx={{ ml: 'auto' }}
                >
                    Download
                </Button>
            </Box>

            <DialogContent 
                sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    overflow: 'auto',
                    position: 'relative',
                    p: 2
                }}
            >
                {!imageUrl ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            No Receipt Available
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            The receipt image has not been uploaded yet.
                        </Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="error">
                            Failed to Load Receipt
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            The image could not be loaded. Please check the file path.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {loading && (
                            <Box 
                                sx={{ 
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 1
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        )}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%',
                                overflow: 'auto'
                            }}
                        >
                            <img
                                src={imageUrl}
                                alt="Submitted Receipt"
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                    transition: 'transform 0.3s ease',
                                    cursor: zoom > 1 ? 'move' : 'default',
                                    display: loading ? 'none' : 'block'
                                }}
                            />
                        </Box>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                {referenceId && (
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto' }}>
                        Reference: {referenceId}
                    </Typography>
                )}
                <Button onClick={onClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SubmittedReceiptPreviewDialog;
