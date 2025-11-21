import React from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Stack
} from "@mui/material";
import { Visibility as VisibilityIcon, Print as PrintIcon, Download as DownloadIcon } from "@mui/icons-material";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { useCookies } from "react-cookie";
import DailyCollectionReport from "./reports/DailyCollectionReport"; // repurposed as preview card

type TransactionRow = {
  date: string;
  confirmationNumber: string;
  payor: string;
  particulars: string;
  total: number;
  taxes: number;
  fees: number;
  other: number;
};

const Reports = () => {
  const [{ accessToken }] = useCookies(["accessToken"]);
  const [reportType, setReportType] = React.useState("");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<TransactionRow[]>([]);
  const [showPreview, setShowPreview] = React.useState(false);

  const handlePreview = async () => {
    if (!reportType || !fromDate) {
      alert("Please select report type and date range");
      return;
    }
    setLoading(true);
    setError(null);
    setShowPreview(false);
    try {
      const targetDate = fromDate;
      const res = await axiosInstanceWithAuthorization(accessToken).get(
        `/api/reports/daily-collection?from=${targetDate}&to=${targetDate}`
      );
      if (res.status === 200) {
        setData(res.data?.data || []);
        setShowPreview(true);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = async () => {
    if (!reportType || !fromDate) return;
    try {
      const res = await axiosInstanceWithAuthorization(accessToken).get(
        `/api/reports/daily-collection/export?from=${fromDate}&to=${fromDate}&format=xlsx`,
        { responseType: "blob" }
      );
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName = `daily-collection-${fromDate}-${fromDate}.xlsx`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to download Excel");
    }
  };

  return (
    <Box id="print-root">
      {/* Filter Section */}
      <Typography variant="h6" color="textSecondary" letterSpacing={3} textTransform="uppercase" mb={1} className="no-print">
        Generate Report
      </Typography>
      <Box sx={{ bgcolor: "background.paper", borderRadius: 4, boxShadow: 2, p: 3 }} className="no-print">
        <Box sx={{ display: "grid", gap: 2, maxWidth: 420 }}>
          <FormControl fullWidth>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label="Report Type"
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="daily-collection">Daily Collection Report</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
            {/* <TextField
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            /> */}
          <Button
            variant="contained"
            startIcon={<VisibilityIcon />}
            onClick={handlePreview}
            disabled={!reportType || !fromDate || loading}
          >
            {loading ? <CircularProgress size={24} /> : "Preview Report"}
          </Button>
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </Box>

      {/* Preview Card */}
      {showPreview && (
        <Box sx={{ mt: 2, position: "relative" }}>
          <Stack
            direction="row"
            spacing={1}
            className="no-print"
            sx={{ mb: 1, justifyContent: "flex-end" }}
          >
            <IconButton color="primary" onClick={handlePrint}>
              <PrintIcon />
            </IconButton>
            <IconButton color="primary" onClick={handleDownloadExcel}>
              <DownloadIcon />
            </IconButton>
          </Stack>
          <DailyCollectionReport
            from={fromDate}
            to={fromDate}
            rows={data}
          />
        </Box>
      )}
    </Box>
  );
};

export default React.memo(Reports);
