import React from 'react';
import { Grid, Typography, IconButton, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const ReceiptViewerComponent = ({ image }: { image: string }) => {
  const handleDownload = React.useCallback(async () => {
    if (!image) return;

    try {
      // Fetch as blob (works even with cross-origin if CORS is allowed)
      const response = await fetch(image, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = image.split('/').pop() || 'receipt.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Unable to download the receipt. Please check the file URL or CORS settings.');
    }
  }, [image]);

  return (
    <Grid
      size={12}
      sx={{
        position: 'relative',
        backgroundColor: '#f0f0f0',
        borderRadius: 2,
        aspectRatio: '1/1',
        overflow: 'hidden',
        border: '1px dashed rgba(0, 0, 0, 0.23)',
      }}
    >
      {image ? (
        <>
          <img
            src={image}
            alt="Receipt Preview"
            loading="lazy"
            style={{
              objectFit: 'contain',
              objectPosition: 'center',
              width: '100%',
              height: '100%',
              padding: '8px',
            }}
          />
          <Tooltip title="Download Receipt">
            <IconButton
              onClick={handleDownload}
              color="primary"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
              }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <Typography
          variant="h6"
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
          }}
        >
          No Receipt Uploaded
        </Typography>
      )}
    </Grid>
  );
};

export default React.memo(ReceiptViewerComponent);
