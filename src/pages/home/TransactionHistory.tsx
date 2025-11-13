import React from "react";
import { Alert, Box, IconButton, Tooltip, Typography } from "@mui/material";
import { Subject as SubjectIcon } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useAxios } from "../../hooks/useAxios";
// import TransactionModal from "@/components/modals/TransactionModal";
import TransactionModalForStudent from "@/components/modals/TransactionDialogForStudent";
import TransactionModalForEmployee from "@/components/modals/TransactionDialogForEmployee";
import TransactionModalForExternal from "@/components/modals/TransactionDialogForExternal";
import CustomCircularProgress from "@/components/CustomCircularProgress";
import { TransactionDataType } from "../admin/Transactions/type";
const TransactionHistory = () => {
  const [rows, setRows] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<TransactionDataType | null>(null);
  const { data, loading, error } = useAxios({
    url: "/api/transactions/student-id",
    authorized: true,
  });

  const columns = [
    { field: "_id", headerName: "No.", width: 100 },
    { field: "reference_id", headerName: "Reference ID", minWidth: 250, flex: 1.5 },
    { field: "status", headerName: "Status", minWidth: 175, flex: 1.5 },
    { field: "created_at", headerName: "Created At", minWidth: 200, flex: 1, valueGetter: (value: string) => new Date(value).toLocaleString() },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: ({ row }: { row: any }) => {
        const handleClick = () => {
          setOpen(true);
          setSelectedRow(row);
        };
        return (
          <Tooltip title="View">
            <IconButton color="primary" onClick={handleClick}>
              <SubjectIcon />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  const renderTransactionDialog = () => {
    switch (selectedRow?.userType) {
      case "Student":
        return <TransactionModalForStudent open={open} data={selectedRow} onClose={() => setOpen(false)} />;
      case "Employee":
        return <TransactionModalForEmployee open={open} data={selectedRow} onClose={() => setOpen(false)} />;
      case "External":
        return <TransactionModalForExternal open={open} data={selectedRow} onClose={() => setOpen(false)} />;
      default:
        return null;
    }
  }
  React.useEffect(() => {
    if (!loading && Array.isArray(data)) {
      const filteredData = data.map((item: any, index: number) => ({ ...item, _id: ++index }));
      setRows(filteredData);
    }
  }, [data, loading]);

  if (loading) return <CustomCircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <React.Suspense fallback={<CustomCircularProgress />}>
      <Typography variant="h6" color="textSecondary" letterSpacing={3} textTransform={"uppercase"} mb={1}>
        Transaction History
      </Typography>
      <Box sx={{ display: "grid", gap: 2 }}>
        <Box sx={{ bgcolor: "background.paper", borderRadius: 4, boxShadow: 2, p: 2, overflow: "auto" }}>
          {/* <Typography variant="h6" mb={2}>
            Transactions
          </Typography> */}
          <Box sx={{ maxHeight: "calc(100dvh - 225px)", overflow: "auto" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={loading}
              disableRowSelectionOnClick
              sx={{
                borderRadius: 2,
              }}
            />
          </Box>
        </Box>
      </Box>
      {open && renderTransactionDialog()}
    </React.Suspense>
  );
};

export default React.memo(TransactionHistory);
