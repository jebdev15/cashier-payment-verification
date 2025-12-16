import React from "react";
import { Alert, Box, IconButton, Tooltip, Typography, Pagination, Tabs, Tab, Button } from "@mui/material";
import { Subject as SubjectIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { TransactionDataType } from "./type";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { useCookies } from "react-cookie";
import TransactionDialogForStudent from "@/components/modals/admin/TransactionDialogForStudent";
import TransactionDialogForExternal from "@/components/modals/admin/TransactionDialogForExternal";
import TransactionDialogForEmployee from "@/components/modals/admin/TransactionDialogForEmployee";

// Simple module-level cache keyed by "status:offset:limit"
const txPageCache: Record<string, { items: TransactionDataType[]; total: number }> = {};
const txInflight: Record<string, Promise<{ items: TransactionDataType[]; total: number }>> = {};

// Module-level cache for particulars (persists across component remounts)
let particularsCache: any[] | null = null;
let particularsPromise: Promise<any[]> | null = null;

const filterMiscellaneousFeeAsPayload = (checkedItems: string[], miscellaneousFees: any[]) => {
  return miscellaneousFees.filter(
    (fee) => Number(fee.balance) > 0 && checkedItems.includes(fee.nature_of_collection_id.toString())
  );
};

const ShowTransactions = () => {
  const [cookie] = useCookies(["accessToken"]);
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState<TransactionDataType[]>([]);
  const [selectedRow, setSelectedRow] = React.useState<TransactionDataType | null>(null);
  const [editable, setEditable] = React.useState(false);
  const [refresh, setRefresh] = React.useState(false);
  const [allParticulars, setAllParticulars] = React.useState<any[]>([]);

  // ✅ Pagination states (offset–limit model)
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [totalCount, setTotalCount] = React.useState(0);
  const offset = (page - 1) * limit;

  const [loading, setLoading] = React.useState(false);
  const [updateLoading, setUpdateLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ✅ Tabs: default to "pending"
  const [tabValue, setTabValue] = React.useState<string>("pending");
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
      const statusParam = `&status=${encodeURIComponent(tabValue)}`;
      // Reuse inflight request for same key
      if (!txInflight[key]) {
        txInflight[key] = (async () => {
          const response = await axiosInstanceWithAuthorization(cookie.accessToken).get(
            `/api/admin-transactions?offset=${offset}&limit=${limit}${statusParam}`
          );
          if (response.status !== 200) return { items: [], total: 0 };

          const resData = response.data;

          // Normalize response
          // Support shapes: {data:{items,total}} | {data:[]} | [] | array with totalCount in first row
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

  // Fetch particulars with module-level caching (persists across component remounts)
  React.useEffect(() => {
    const fetchParticulars = async () => {
      // If already cached, use it immediately
      if (particularsCache) {
        setAllParticulars(particularsCache);
        return;
      }

      // If request is in-flight, reuse it
      if (!particularsPromise) {
        particularsPromise = (async () => {
          try {
            const response = await axiosInstanceWithAuthorization(cookie.accessToken).get('/api/particulars');
            if (response.data) {
              particularsCache = response.data;
              return response.data;
            }
            return [];
          } catch (error) {
            console.error('Error fetching particulars:', error);
            particularsPromise = null; // Allow retry on error
            return [];
          }
        })();
      }

      const data = await particularsPromise;
      setAllParticulars(data);
    };
    
    fetchParticulars();
  }, [cookie.accessToken]);

  // Invalidate the cache when refresh is triggered (e.g., after update)
  React.useEffect(() => {
    if (!refresh) return;
    Object.keys(txPageCache).forEach((k) => delete txPageCache[k]);
    Object.keys(txInflight).forEach((k) => delete txInflight[k]);
    fetchTransactions();
    setRefresh(false);
  }, [refresh, fetchTransactions]);

  const columns = [
    { field: "_id", headerName: "No.", width: 100 },
    { field: "userType", headerName: "User Type", minWidth: 50 },
    { field: "payor", headerName: "Payor", minWidth: 250, flex: 1 },
    { field: "referenceId", headerName: "Reference ID", minWidth: 175, flex: 1 },
    {
      field: "status",
      headerName: "Status",
      width: 125,
      renderCell: ({ row }: { row: TransactionDataType }) => (
        <Typography
          variant="caption"
          sx={{
            color:
              row.status === "approved"
                ? "green"
                : row.status === "rejected"
                  ? "red"
                  : "orange",
          }}
        >
          {row.status?.toUpperCase()}
        </Typography>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      valueGetter: (value: string) => new Date(value).toLocaleString(),
    },
    {
      field: "action",
      headerName: "Action",
      width: 125,
      renderCell: ({ row }: { row: TransactionDataType }) => {
        const handleClick = () => {
          setOpen(true);
          setSelectedRow(row);
          setEditable(row.status === "pending");
        };
        return (
          <Tooltip title={row.status === "pending" ? "Edit" : "View"}>
            <IconButton color="primary" onClick={handleClick}>
              <SubjectIcon />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  const handleUpdateTransaction = async (updatedData: TransactionDataType) => {
    const confirmation = window.confirm("Are you sure you want to update this transaction?");
    if (!confirmation) return;

    setUpdateLoading(true);
    try {
      const miscFee = filterMiscellaneousFeeAsPayload(
        updatedData.checkedItems || [],
        updatedData.miscellaneousFees || []
      );
      const formData = new FormData();
      formData.append("id", updatedData.id || "");
      // fixed: use camelCase property access
      formData.append("studentAccountID", updatedData.studentAccountId || "");
      // convert snake_case -> camelCase usage
      formData.append("referenceID", updatedData.referenceId || "");
      formData.append("referenceNumber", updatedData.referenceNumber || "");
      formData.append("studentID", updatedData.studentId || "");
      formData.append("nameOfPayor", updatedData.payor || "");
      formData.append("email", updatedData.email || "");
      formData.append("programCode", updatedData.programCode || "");
      formData.append("yearLevelRoman", updatedData.yearLevelRoman || "");
      formData.append("schoolYear", updatedData.schoolYear || "");
      formData.append("semester", updatedData.semester || "");
      formData.append("modeOfPayment", updatedData.modeOfPayment || "");
      formData.append("status", updatedData.status || "");
      formData.append("fundCluster", updatedData.selectedAccount || "");
      formData.append("particulars", updatedData.particulars || "");
      formData.append("details", updatedData.details || "");
      formData.append(
        "amountToPay",
        updatedData.amountToPay ? updatedData.amountToPay.toString() : "0"
      );
      formData.append(
        "amountTendered",
        updatedData.amountTendered ? updatedData.amountTendered.toString() : "0"
      );
      formData.append("checkedItems", JSON.stringify(updatedData.checkedItems || []));
      formData.append("miscellaneousFees", JSON.stringify(miscFee || []));
      formData.append("userType", updatedData.userType || "");
      formData.append("adminParticulars", JSON.stringify(updatedData.adminParticulars || []));
      formData.append("adminParticularsText", updatedData.adminParticularsText || "");
      formData.append(
        "distribution",
        JSON.stringify(
          updatedData.distribution || {
            miscellaneous: 0,
            tuition: 0,
            totalPayable: 0,
            accountsPayable: 0,
          }
        )
      );

      const response = await axiosInstanceWithAuthorization(cookie.accessToken).put(
        `/api/admin-transactions/${updatedData.id}`,
        formData
      );

      if (response.status === 200) {
        alert("Transaction updated successfully");
        setOpen(false);
        setRefresh(true);
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Failed to update transaction. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const renderTransactionDialog = () => {
    switch (selectedRow?.userType) {
      case "Student":
        return (
          <TransactionDialogForStudent
            open={open}
            onClose={() => setOpen(false)}
            data={selectedRow}
            onSave={handleUpdateTransaction}
            editable={editable}
            allParticulars={allParticulars}
            loading={updateLoading}
          />
        );
      case "External":
        return (
          <TransactionDialogForExternal
            open={open}
            onClose={() => setOpen(false)}
            data={selectedRow}
            onSave={handleUpdateTransaction}
            editable={editable}
            allParticulars={allParticulars}
            loading={updateLoading}
          />
        );
      case "Employee":
        return (
          <TransactionDialogForEmployee
            open={open}
            onClose={() => setOpen(false)}
            data={selectedRow}
            onSave={handleUpdateTransaction}
            editable={editable}
            allParticulars={allParticulars}
            loading={updateLoading}
          />
        );
      default:
        return null;
    }
  };

  if (error) return <Alert severity="error">{error}</Alert>;

  const transactions =
    data?.map((item: TransactionDataType, index: number) => ({
      ...item,
      _id: offset + index + 1,
    })) || [];

  const totalPages = Math.ceil(totalCount / limit);

  // ✅ Manual reload function
    const handleReload = () => {
      // Clear cache
      Object.keys(txPageCache).forEach((k) => delete txPageCache[k]);
      Object.keys(txInflight).forEach((k) => delete txInflight[k]);
      // Refetch current page
      fetchTransactions();
    };

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Typography
        variant="h6"
        color="textSecondary"
        letterSpacing={3}
        textTransform="uppercase"
        mb={1}
      >
        Transactions
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

          { /* Tabs */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="All" value="all" />
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

export default React.memo(ShowTransactions);
