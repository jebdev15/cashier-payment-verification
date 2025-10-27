import React from "react";
import { Alert, Box, IconButton, Typography, Tooltip } from "@mui/material";
import { Edit as EditIcon, Subject as SubjectIcon } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router";
import { AccountDataType } from "./type";
import { useAxios } from "@/hooks/useAxios";
import CustomCircularProgress from "@/components/CustomCircularProgress";

const ShowAccounts = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useAxios({
    url: "/api/users",
    authorized: true,
  });

  const columns = [
    { field: "id", headerName: "No.", width: 100 },
    { field: "userType", headerName: "User Type", minWidth: 50 },
    { field: "payorName", headerName: "Payor Name", minWidth: 150, flex: 1 },
    { field: "email", headerName: "Email Address", minWidth: 100, flex: 1 },
    {
      field: "status",
      headerName: "Status",
      width: 125,
      renderCell: ({ row }: { row: AccountDataType }) => {
        return (
          <Typography variant="caption" sx={{ color: row.status === "approved" ? "green" : row.status === "rejected" ? "red" : "orange" }}>
            {row.status.toUpperCase()}
          </Typography>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 125,
      renderCell: ({ row }: { row: AccountDataType }) => {
        // if (row.status !== 'pending') return null;
        return (
          <Tooltip title={row.status === "pending" ? "Edit" : "View"}>
            <IconButton color="primary" onClick={() => navigate(`/admin/accounts/${row.user_id}`)}>
              {row.status === "pending" ? <EditIcon /> : <SubjectIcon />}
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  if (loading) return <CustomCircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const accounts = data?.map((item: AccountDataType, index: number) => ({ ...item, id: ++index, user_id: item.id })) || [];

  return (
    <React.Suspense fallback={<CustomCircularProgress />}>
      <Typography variant="h6" color="textSecondary" letterSpacing={3} textTransform={"uppercase"} mb={1}>
        User Account Management
      </Typography>

      <Box sx={{ display: "grid", gap: 2 }}>

        <Box sx={{ bgcolor: "background.paper", borderRadius: 4, boxShadow: 2, p: 2, overflow: "auto" }}>
          <Typography variant="h6" mb={2}>
            Student User Accounts
          </Typography>
          <Box sx={{ maxHeight: 400 }}>
            <DataGrid
              columns={columns}
              rows={accounts}
              loading={loading}
              disableRowSelectionOnClick
              sx={{
                borderRadius: 2,
              }}
            />
          </Box>
        </Box>
      </Box>
    </React.Suspense>
  );
};

export default React.memo(ShowAccounts);
