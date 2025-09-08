import React from "react";
import { Alert, Box, IconButton, Paper, Tooltip, Typography, Divider } from "@mui/material";
import { Subject as SubjectIcon } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { SnackbarState, TransactionDataType } from "./type";
// import { useNavigate } from 'react-router'
import { useAxios } from "@/hooks/useAxios";
import TransactionModal from "@/components/modals/TransactionModal";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { useCookies } from "react-cookie";

const filterMiscellaneousFeeAsPayload = (checkedItems: string[], miscellaneousFees: any[]) => {
  const filteredMiscellaneousFee = miscellaneousFees.filter((fee) => Number(fee.balance) > 0 && checkedItems.includes(fee.nature_of_collection_id.toString()));
  // console.log({ checkedItems, filteredMiscellaneousFee })
  return filteredMiscellaneousFee;
};
const ShowTransactions = () => {
  // const navigate = useNavigate();
  const [cookie] = useCookies(["accessToken"]);
  const [open, setOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<TransactionDataType | null>(null);
  const [editable, setEditable] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<SnackbarState>({ open: false, message: "", severity: undefined });
  const [entryModes, setEntryModes] = React.useState<string[]>([]);

  const { data, loading, error } = useAxios({
    url: "/api/transactions",
    authorized: true,
  });

  const { data: entryModeData } = useAxios({
    url: "/api/transactions/entry-mode",
    authorized: true,
  });
  const columns = [
    { field: "_id", headerName: "No.", width: 100 },
    { field: "fullName", headerName: "Full name", minWidth: 250, flex: 1 },
    { field: "reference_id", headerName: "Reference ID", minWidth: 175, flex: 1 },
    { field: "status", headerName: "Status", width: 125 },
    {
      field: "created_at",
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

  const externalColumns = [
    { field: "_id", headerName: "No.", width: 100 },
    { field: "name_of_payor", headerName: "Name of Institution/Agency", minWidth: 250, flex: 1 },
    { field: "reference_id", headerName: "Reference ID", minWidth: 160, flex: 1 },
    { field: "status", headerName: "Status", width: 125 },
    {
      field: "created_at",
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
    const miscFee = filterMiscellaneousFeeAsPayload(updatedData.checkedItems || [], updatedData.miscellaneousFees || []);
    const formData = new FormData();
    formData.append("id", updatedData.id || "");
    formData.append("studentAccountID", updatedData.student_account_id || "");
    formData.append("referenceID", updatedData.reference_id || "");
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
    formData.append("amountToPay", updatedData.amountToPay ? updatedData.amountToPay.toString() : "0");
    formData.append("amountTendered", updatedData.amountTendered ? updatedData.amountTendered.toString() : "0");
    formData.append("checkedItems", JSON.stringify(updatedData.checkedItems || []));
    formData.append("miscellaneousFees", JSON.stringify(miscFee || []));

    // for(const [index, fee] of miscFee.entries()) {
    //   console.log(`Miscellaneous Fee ${index + 1}:`, fee.item_title, fee.amount);
    // }
    const response = await axiosInstanceWithAuthorization(cookie.accessToken).put(`/api/transactions/${updatedData.id}`, formData);
    console.log({
      message: response.data.message,
    });
  };
  React.useEffect(() => {
    if (entryModeData && entryModeData.length > 0) {
      setEntryModes(entryModeData);
    }
  }, [entryModeData]);
  if (error) return <Alert severity="error">{error}</Alert>;

  const studentTransactions = data?.filter((item: TransactionDataType) => item.userType === "Student").map((item: TransactionDataType, index: number) => ({ ...item, _id: index + 1 })) || [];
  const externalTransactions = data?.filter((item: TransactionDataType) => item.userType === "External").map((item: TransactionDataType, index: number) => ({ ...item, _id: index + 1 })) || [];

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Typography variant="h6" color="textSecondary" letterSpacing={3} textTransform={"uppercase"} mb={1}>
        Transactions
      </Typography>
      <Box sx={{ display: "grid", gap: 2 }}>
        <Box sx={{ bgcolor: "background.paper", borderRadius: 4, boxShadow: 2, p: 2, overflow: "auto" }}>
          <Typography variant="h6" mb={2}>
            External Transactions
          </Typography>
          <Box sx={{ maxHeight: 400, overflow: "auto" }}>
            <DataGrid
              rows={externalTransactions}
              columns={externalColumns}
              loading={loading}
              disableRowSelectionOnClick
              sx={{
                borderRadius: 2,
              }}
            />
          </Box>
        </Box>

        <Box sx={{ bgcolor: "background.paper", borderRadius: 4, boxShadow: 2, p: 2, overflow: "auto" }}>
          <Typography variant="h6" mb={2}>
            Student Transactions
          </Typography>
          <Box sx={{ maxHeight: 400, overflow: "auto" }}>
            <DataGrid
              rows={studentTransactions}
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
      {open && <TransactionModal open={open} onClose={() => setOpen(false)} data={selectedRow} entryModes={entryModes} snackbar={snackbar} onSave={handleUpdateTransaction} editable={editable} />}
    </React.Suspense>
  );
};

export default React.memo(ShowTransactions);
