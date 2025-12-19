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
  Stack,
  Dialog,
  DialogContent
} from "@mui/material";
import { Visibility as VisibilityIcon, Print as PrintIcon, Close as CloseIcon } from "@mui/icons-material";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { useCookies } from "react-cookie";
import DailyCollectionReport from "./reports/DailyCollectionReport";

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
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [reportData, setReportData] = React.useState<{
    rows: TransactionRow[];
    reportNo: string;
    fundClusters: string;
    startSheetNo: number;
    totalSheets: number;
    from: string;
    to: string;
  } | null>(null);

  const handlePreview = async () => {
    if (!reportType || !fromDate) {
      alert("Please select report type and date range");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const targetDate = fromDate;
      const res = await axiosInstanceWithAuthorization(accessToken).get(
        `/api/reports/daily-collection?from=${targetDate}&to=${targetDate}`
      );
      if (res.status === 200) {
        setReportData({
          rows: res.data?.data?.rows || res.data?.data || [],
          reportNo: res.data?.data?.reportNo || "",
          fundClusters: res.data?.data?.fundClusters || "",
          startSheetNo: res.data?.data?.startSheetNo || 1,
          totalSheets: res.data?.data?.totalSheets || 1,
          from: targetDate,
          to: targetDate
        });
        setOpenDialog(true);
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // const handleDownloadExcel = async () => {
  //   if (!reportType || !fromDate) return;
  //   try {
  //     const res = await axiosInstanceWithAuthorization(accessToken).get(
  //       `/api/reports/daily-collection/export?from=${fromDate}&to=${fromDate}&format=xlsx`,
  //       { responseType: "blob" }
  //     );
  //     const blob = new Blob([res.data], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     const fileName = `daily-collection-${fromDate}-${fromDate}.xlsx`;
  //     a.download = fileName;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     URL.revokeObjectURL(url);
  //   } catch (e: any) {
  //     alert(e?.response?.data?.message || "Failed to download Excel");
  //   }
  // };

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
            {loading ? <CircularProgress size={24} /> : "Generate Report"}
          </Button>
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </Box>

      {/* Report Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            width: '98vw',
            height: '98vh',
            maxWidth: 'none',
            m: 0
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', overflow: 'hidden' }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1000,
              bgcolor: 'rgba(255,255,255,0.95)',
              borderRadius: 1,
              p: 0.5,
              boxShadow: 2
            }}
            className="no-print"
          >
            <IconButton color="primary" onClick={handlePrint} size="small">
              <PrintIcon />
            </IconButton>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
          {reportData && (
            <Box sx={{ 
              p: 0, 
              overflow: 'auto', 
              height: '100%',
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}>
              <DailyCollectionReport
                from={reportData.from}
                to={reportData.to}
                rows={reportData.rows}
                reportNo={reportData.reportNo}
                fundClusters={reportData.fundClusters}
                startSheetNo={reportData.startSheetNo}
                totalSheets={reportData.totalSheets}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default React.memo(Reports);