import React from "react";
import { Box, IconButton, Stack } from "@mui/material";
import { Print as PrintIcon } from "@mui/icons-material";
import DailyCollectionReport from "./DailyCollectionReport";
import { useNavigate } from "react-router-dom";

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

type ReportData = {
  rows: TransactionRow[];
  reportNo: string;
  fundClusters: string;
  startSheetNo: number;
  totalSheets: number;
  from: string;
  to: string;
};

const ReportPreview = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = React.useState<ReportData | null>(null);

  React.useEffect(() => {
    // Get data from sessionStorage
    const data = sessionStorage.getItem('reportData');
    if (data) {
      setReportData(JSON.parse(data));
      // Clear sessionStorage after loading
      sessionStorage.removeItem('reportData');
    } else {
      // If no data, redirect back
      window.close();
    }
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (!reportData) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", p: 2 }}>
      <Stack
        direction="row"
        spacing={1}
        className="no-print"
        sx={{ mb: 2, justifyContent: "flex-end" }}
      >
        <IconButton color="primary" onClick={handlePrint} size="large">
          <PrintIcon />
        </IconButton>
      </Stack>
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
  );
};

export default React.memo(ReportPreview);
