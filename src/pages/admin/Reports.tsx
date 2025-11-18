import React from "react";
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import { Print as PrintIcon } from "@mui/icons-material";

const Reports = () => {
  const [reportType, setReportType] = React.useState("");

  const handlePrint = () => {
    if (!reportType) {
      alert("Please select a report type");
      return;
    }
    // Open print page in new window
    const printWindow = window.open(`/admin/reports/print/${reportType}`, "_blank");
    if (printWindow) {
      printWindow.focus();
    }
  };

  return (
    <>
      <Typography variant="h6" color="textSecondary" letterSpacing={3} textTransform="uppercase" mb={1}>
        Generate Report
      </Typography>

      <Box sx={{ bgcolor: "background.paper", borderRadius: 4, boxShadow: 2, p: 3 }}>
        <Box sx={{ display: "grid", gap: 2, maxWidth: 400 }}>
          <FormControl fullWidth>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label="Report Type"
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="daily-collection">Daily Collection Report</MenuItem>
              {/* Add more report types here */}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={!reportType}
          >
            Open Print Preview
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default React.memo(Reports);
