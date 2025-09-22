import React from 'react'
import { Grid, Typography } from '@mui/material'

const ReceiptViewerComponent = ({ image }: { image: string }) => {
    return (
        <Grid size={12} sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, aspectRatio: "1/1", overflow: "hidden", border: "1px dashed rgba(0, 0, 0, 0.23)" }}>
            {image ? (
                <img
                    src={image}
                    alt="Preview"
                    height={400}
                    width="100%"
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
    )
}

export default React.memo(ReceiptViewerComponent)