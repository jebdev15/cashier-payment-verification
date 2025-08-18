import React from "react";
import { Alert, Box, IconButton, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { Subject as SubjectIcon } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useAxios } from "../../hooks/useAxios";
import TransactionModal from "@/components/modals/TransactionModal";

const TransactionHistory = () => {
  const isMediumScreen = useMediaQuery("(max-width: 900px)");
  const [rows, setRows] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState(null);
  const { data, loading, error } = useAxios({
    url: "/api/transactions/student-id",
    authorized: true,
  });
  const columns = [
    { field: "_id", headerName: "No.", width: 70 },
    { field: "reference_id", headerName: "Reference ID", width: 200 },
    { field: "status", headerName: "Status", width: 160 },
    { field: "created_at", headerName: "Created At", width: 200, valueGetter: (value: string) => new Date(value).toLocaleString() },
    {
      field: "action", headerName: "Action", width: 160, renderCell: ({ row }: { row: any }) => {
        const handleClick = () => {
          setOpen(true);
          setSelectedRow(row);
        }
        return (
          <Tooltip title="View">
            <IconButton color="primary" onClick={handleClick}>
              <SubjectIcon />
            </IconButton>
          </Tooltip>
        )
      }
    },
  ];
  React.useEffect(() => {
    if (!loading && Array.isArray(data)) {
      const filteredData = data.map((item: any, index: number) => ({ ...item, _id: ++index }));
      setRows(filteredData);
    }
  }, [data, loading])
  if (loading) return <p>Loading...</p>;
  if (error) return <Alert severity="error">{error}</Alert>;
  return (
    <React.Suspense fallback={<p>Loading...</p>}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant={isMediumScreen ? "h5" : "h4"} color="initial" sx={{ marginBottom: 4 }}>
          Transaction History
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <DataGrid
            sx={{
              borderRadius: 2,
              borderColor: "rgba(0,0,0,0.23)",
              width: "100%",
              minHeight: 500
            }}
            rows={rows}
            columns={columns}
            loading={loading}
          />
        </Box>
      </Box>
      <TransactionModal
        open={open}
        data={selectedRow}
        onClose={() => setOpen(false)}
      />
    </React.Suspense>
  );
};

export default React.memo(TransactionHistory);
