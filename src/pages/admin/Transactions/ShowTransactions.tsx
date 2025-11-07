import React from "react";
import { Alert, Box, IconButton, Tooltip, Typography, Pagination } from "@mui/material";
import { Subject as SubjectIcon } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { TransactionDataType, TransactionModalEntryModeType } from "./type";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { useCookies } from "react-cookie";
import TransactionDialogForStudent from "@/components/modals/TransactionDialogForStudent";
import TransactionDialogForExternal from "@/components/modals/TransactionDialogForExternal";
import TransactionDialogForEmployee from "@/components/modals/TransactionDialogForEmployee";

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
  const [entryModes, setEntryModes] = React.useState<TransactionModalEntryModeType[]>([]);
  const [refresh, setRefresh] = React.useState(false);

  // ✅ Pagination states (offset–limit model)
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [totalCount, setTotalCount] = React.useState(0);
  const offset = (page - 1) * limit;

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // const [tabValue, setTabValue] = React.useState(0);
  // const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
  //   setTabValue(newValue);
  // }
  // ✅ Fetch transactions (server-side pagination)
  const fetchTransactions = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstanceWithAuthorization(cookie.accessToken).get(
        `/api/admin-transactions?offset=${offset}&limit=${limit}`
      );

      if (response.status === 200) {
        const resData = response.data;
        setData(resData.data || resData); // Handle both array or {data:[]} shapes
        setTotalCount(resData[0].totalCount || resData.total || resData.length || 0);
      }
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  }, [cookie.accessToken, offset, limit]);

  // ✅ Fetch entry modes
  const fetchEntryModes = React.useCallback(async () => {
    try {
      const response = await axiosInstanceWithAuthorization(cookie.accessToken).get(
        "/api/transactions/entry-mode"
      );
      if (response.status === 200) setEntryModes(response.data);
    } catch (error) {
      console.error("Error fetching entry modes:", error);
    }
  }, [cookie.accessToken]);

  React.useEffect(() => {
    fetchTransactions();
    fetchEntryModes();
  }, [fetchTransactions, fetchEntryModes, refresh]);

  const columns = [
    { field: "_id", headerName: "No.", width: 100 },
    { field: "userType", headerName: "User Type", minWidth: 50 },
    { field: "payorName", headerName: "Payor Name", minWidth: 250, flex: 1 },
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
          <Tooltip title={row.status === "approved" ? "View" : "Edit"}>
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

    try {
      const miscFee = filterMiscellaneousFeeAsPayload(
        updatedData.checkedItems || [],
        updatedData.miscellaneousFees || []
      );
      const formData = new FormData();
      formData.append("id", updatedData.id || "");
      formData.append("studentAccountID", updatedData.student_account_id || "");
      formData.append("referenceID", updatedData.reference_id || "");
      formData.append("referenceNumber", updatedData.reference_number || "");
      formData.append("studentID", updatedData.student_id || "");
      formData.append("nameOfPayor", updatedData.name_of_payor || "");
      formData.append("email", updatedData.email || "");
      formData.append("programCode", updatedData.program_code || "");
      formData.append("yearLevelRoman", updatedData.year_level_roman || "");
      formData.append("schoolYear", updatedData.school_year || "");
      formData.append("semester", updatedData.semester || "");
      formData.append("modeOfPayment", updatedData.mode_of_payment || "");
      formData.append("status", updatedData.status || "");
      formData.append("entryMode", updatedData.entryMode || "");
      formData.append("accountType", updatedData.selectedAccount || "");
      formData.append("particulars", updatedData.particulars || "");
      formData.append("details", updatedData.details || "");
      formData.append("remarks", updatedData.remarks || "");
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
        `/api/transactions/${updatedData.id}`,
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
            entryModes={entryModes}
            onSave={handleUpdateTransaction}
            editable={editable}
          />
        );
      case "External":
        return (
          <TransactionDialogForExternal
            open={open}
            onClose={() => setOpen(false)}
            data={selectedRow}
            entryModes={entryModes}
            onSave={handleUpdateTransaction}
            editable={editable}
          />
        );
      case "Employee":
        return (
          <TransactionDialogForEmployee
            open={open}
            onClose={() => setOpen(false)}
            data={selectedRow}
            entryModes={entryModes}
            onSave={handleUpdateTransaction}
            editable={editable}
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
          { /* Tabs */}
          {/* <Tabs
            value={tabValue}  // Current tab value
            onChange={handleTabChange}  // Function to handle tab change
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="All" value="all" />
            <Tab label="Pending" value="pending" />
            <Tab label="Approved" value="approved" />
            <Tab label="Rejected" value="rejected" />
          </Tabs> */}

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
