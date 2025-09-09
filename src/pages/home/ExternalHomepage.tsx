import React from "react";
import { Box, Typography, Grid, Card, CardContent, CardActions, Button } from "@mui/material";
import { CloudUpload, History, Info } from "@mui/icons-material";
import { useNavigate } from "react-router";

const ExternalHomePage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, External User!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Submit your receipts and monitor your transaction verification.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={3} sx={{ borderRadius: 4, p: 4 }}>
            <CardContent sx={{ p: 0 }}>
              <CloudUpload color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h6">Upload Receipts</Typography>
              <Typography variant="body2" color="text.secondary">
                Submit your payment receipts for verification.
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 0, pt: 2 }}>
              <Button variant="outlined" onClick={() => navigate("/home/external/upload-receipt")}>
                Upload Now
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={3} sx={{ borderRadius: 4, p: 4 }}>
            <CardContent sx={{ p: 0 }}>
              <History color="secondary" sx={{ fontSize: 40 }} />
              <Typography variant="h6">Transaction History</Typography>
              <Typography variant="body2" color="text.secondary">
                Track the status of your submitted receipts.
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 0, pt: 2 }}>
              <Button variant="outlined" color="secondary" onClick={() => navigate("/home/transaction-history")}>
                View History
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={3}>
                        <CardContent>
                            <Info color="action" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h6">Support</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Learn how to use the system or contact support.
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" onClick={() => navigate("/home/external/support")}>
                                Get Support
                            </Button>
                        </CardActions>
                    </Card>
                </Grid> */}
      </Grid>
    </Box>
  );
};

export default ExternalHomePage;
