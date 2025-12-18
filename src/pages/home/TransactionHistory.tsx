import React from "react";
import { Alert, Box, IconButton, Tooltip, Typography, Pagination, Tabs, Tab, Button, Chip } from "@mui/material";
import { Subject as SubjectIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { useCookies } from "react-cookie";
import TransactionModalForStudent from "@/components/modals/home/TransactionDialogForStudent";
import TransactionModalForEmployee from "@/components/modals/home/TransactionDialogForEmployee";
import TransactionModalForExternal from "@/components/modals/home/TransactionDialogForExternal";
import { TransactionDataType } from "@/pages/admin/Transactions/type";

// Simple module-level cache keyed by "status:offset:limit"
const txPageCache: Record<string, { items: TransactionDataType[]; total: number }> = {};
const txInflight: Record<string, Promise<{ items: TransactionDataType[]; total: number }>> = {};

const TransactionHistory = () => {
  const [cookie] = useCookies(["accessToken"]);
  const [data, setData] = React.useState<TransactionDataType[]>([]);
  const [open, setOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<TransactionDataType | null>(null);
  const [refresh, setRefresh] = React.useState(false);

  // ✅ Pagination states (offset–limit model)
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [totalCount, setTotalCount] = React.useState(0);
  const offset = (page - 1) * limit;

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ✅ Tabs: default to "all"
  const [tabValue, setTabValue] = React.useState<string>("pending");
  // const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
  //   setTabValue(newValue);
  //   setPage(1); // reset pagination on tab switch
  // };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    setPage(1); // reset pagination on tab switch
  };

  // ✅ Fetch transactions (server-side pagination)
  const fetchTransactions = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const key = `${tabValue}:${offset}:${limit}`;

    // Serve from cache if available
    if (txPageCache[key]) {
      const cached = txPageCache[key];
      setData(cached.items);
      setTotalCount(cached.total);
      setLoading(false);
      return;
    }

    try {
      const statusParam = tabValue !== "all" ? `&status=${encodeURIComponent(tabValue)}` : "";
      // Reuse inflight request for same key
      if (!txInflight[key]) {
        txInflight[key] = (async () => {
          const response = await axiosInstanceWithAuthorization(cookie.accessToken).get(
            `/api/transactions?offset=${offset}&limit=${limit}${statusParam}`
          );
          if (response.status !== 200) return { items: [], total: 0 };

          const resData = response.data;

          // Normalize response
          const items: TransactionDataType[] = Array.isArray(resData?.data?.items)
            ? resData.data.items
            : Array.isArray(resData?.data)
              ? resData.data
              : Array.isArray(resData)
                ? resData
                : [];
          const total =
            Number(resData?.data?.total ?? 0) ||
            Number(resData?.total ?? 0) ||
            (Array.isArray(resData) && resData.length > 0 ? Number(resData[0]?.totalCount ?? 0) : 0);

          txPageCache[key] = { items, total };
          return txPageCache[key];
        })();
      }

      const { items, total } = await txInflight[key];
      setData(items || []);
      setTotalCount(total || 0);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  }, [cookie.accessToken, offset, limit, tabValue]);

  React.useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refresh]);

  // Invalidate the cache when refresh is triggered
  React.useEffect(() => {
    if (!refresh) return;
    Object.keys(txPageCache).forEach((k) => delete txPageCache[k]);
    Object.keys(txInflight).forEach((k) => delete txInflight[k]);
    fetchTransactions();
    setRefresh(false);
  }, [refresh, fetchTransactions]);

  // ✅ Manual reload function
  const handleReload = () => {
    // Clear cache
    Object.keys(txPageCache).forEach((k) => delete txPageCache[k]);
    Object.keys(txInflight).forEach((k) => delete txInflight[k]);
    // Refetch current page
    fetchTransactions();
  };

  const columns = [
    { field: "_id", headerName: "No.", width: 100 },
    { field: "eOr", headerName: "eOR / transaction confirmation number", minWidth: 250, flex: 1.5 },
    { field: "createdAt", headerName: "Submitted At", minWidth: 200, flex: 1, valueGetter: (value: string) => new Date(value).toLocaleString() },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: ({ row }: { row: any }) => {
        const handleClick = () => {
          setOpen(true);
          setSelectedRow(row);
          console.log("Selected Row:", row);
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

  if (error) return <Alert severity="error">{error}</Alert>;

  const transactions =
    data?.map((item: TransactionDataType, index: number) => ({
      ...item,
      _id: offset + index + 1,
    })) || [];

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Typography variant="h6" color="textSecondary" letterSpacing={3} textTransform={"uppercase"} mb={1}>
        Transaction History
      </Typography>
      <Box sx={{ display: "grid", gap: 2, bgcolor: "background.paper", borderRadius: 4, boxShadow: 2, p: 2 }}>
        {/* ✅ Add Reload Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleReload}
            disabled={loading}
          >
            Reload
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Pending" value="pending" />
          <Tab label="Approved" value="approved" />
          <Tab label="Rejected" value="rejected" />
        </Tabs>

        {/* Table */}
        <Box sx={{ minHeight: 420, overflow: "auto" }}>
          <DataGrid
            rows={transactions}
            columns={columns}
            loading={loading}
            disableRowSelectionOnClick
            getRowId={(row) => row._id}
            sx={{ borderRadius: 2 }}
            hideFooterPagination
          />
        </Box>

        {/* ✅ Custom Pagination Controls */}
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      </Box>
      {open && renderTransactionDialog()}
    </React.Suspense>
  );
};

export default React.memo(TransactionHistory);
