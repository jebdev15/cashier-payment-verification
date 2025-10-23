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
    // { field: 'student_id', headerName: 'Student ID', width: 130 },
    { field: "payorName", headerName: "Full Name", minWidth: 250, flex: 1 },
    { field: "email", headerName: "Email Address", minWidth: 225, flex: 1 },
    // { field: 'college', headerName: 'College', width: 200 },
    { field: "program", headerName: "Program", minWidth: 300, flex: 1 },
    { field: "yearLevel", headerName: "Year Level", width: 155 },
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

  const externalUserColumns = [
    { field: "id", headerName: "No.", width: 100 },
    { field: "payorName", headerName: "Name of Institution/Agency", minWidth: 250, flex: 1 },
    { field: "email", headerName: "Email Address", minWidth: 250, flex: 1.5 },
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

  const employeeColumns = [
    { field: "id", headerName: "No.", width: 100 },
    { field: "payorName", headerName: "Name of Employee", minWidth: 250, flex: 1 },
    { field: "email", headerName: "Email Address", minWidth: 250, flex: 1.5 },
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

  const studentAccounts = data?.filter((item: AccountDataType) => item.userType === "Student").map((item: AccountDataType, index: number) => ({ ...item, id: ++index, user_id: item.id })) || [];
  const externalAccounts = data?.filter((item: AccountDataType) => item.userType === "External").map((item: AccountDataType, index: number) => ({ ...item, id: ++index, user_id: item.id })) || [];
  const employeeAccounts = data?.filter((item: AccountDataType) => item.userType === "Employee").map((item: AccountDataType, index: number) => ({ ...item, id: ++index, user_id: item.id })) || [];

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
              rows={studentAccounts}
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
            External User Accounts
          </Typography>
          <Box sx={{ maxHeight: 400, overflow: "auto" }}>
            <DataGrid
              columns={externalUserColumns}
              rows={externalAccounts}
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
            Employee User Accounts
          </Typography>
          <Box sx={{ maxHeight: 400 }}>
            <DataGrid
              columns={employeeColumns}
              rows={employeeAccounts}
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
