import React from "react";
import { Alert, Box, IconButton, Typography, Tooltip, Pagination, Button } from "@mui/material";
import { Edit as EditIcon, Subject as SubjectIcon, Add as AddIcon } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router";
import { AccountDataType, AdminAccountDataType } from "./type";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { useCookies } from "react-cookie";
import CustomCircularProgress from "@/components/CustomCircularProgress";
import { formatAccessLevel } from "@/utils/formatAccessLevel";
import AdminUserAddDialog from "@/components/modals/AdminUserAddDialog";
import AdminUserEditDialog from "@/components/modals/AdminUserEditDialog";
import { useSysUsersCache } from "@/hooks/useSysUsersCache";

const AdminAccounts = () => {
  const navigate = useNavigate();
  const [cookie] = useCookies(["accessToken"]);

  // Server-side data + status/tab
  const [data, setData] = React.useState<AdminAccountDataType[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Pagination (offset-limit)
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [totalCount, setTotalCount] = React.useState(0);
  const offset = (page - 1) * limit;

  // Add/Edit dialog states
  const [openAdd, setOpenAdd] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<AdminAccountDataType | null>(null);

  // Cached sys users for modals
  const { data: sysUsers, loading: sysUsersLoading } = useSysUsersCache();

  // Fetch accounts using offset, limit, and status (tab)
  const fetchAccounts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstanceWithAuthorization(cookie.accessToken).get(
        `/api/admin-users?offset=${offset}&limit=${limit}`
      );

      if (res.status === 200) {
        const resData = res.data;

        // Normalize response to an array and compute total count robustly
        let list: AdminAccountDataType[] = [];
        let total = 0;

        if (Array.isArray(resData?.data?.items)) {
          list = resData.data.items ?? [];
          total = resData.data.total ?? 0;
          console.log("Fetched admin accounts (array):", list, "Total:", total);
        } else {
          // Fallback: attempt to treat any object with a single result slot as array
          list = [];
          total = Number(resData.total ?? 0);
          console.log("Fetched admin accounts (array):", list, "Total:", total);
        }
        console.log("Fetched admin accounts:", list, "Total:", total);
        setData(list);
        setTotalCount(total);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, [cookie.accessToken, offset, limit]);

  React.useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleOpenAdd = () => setOpenAdd(true);
  const handleOpenEdit = (row: AdminAccountDataType) => {
    setSelectedRow(row);
    setOpenEdit(true);
  };

  const handleSuccess = () => {
    fetchAccounts(); // refetch after add/edit
  };

  const columns = [
    { field: "id", headerName: "No.", width: 100 },
    {
      field: "accessLevel",
      headerName: "Role",
      minWidth: 50,
      flex: 1,
      renderCell: ({ row }: { row: AdminAccountDataType }) => {
        return formatAccessLevel(row.accessLevel);
      }
    },
    { field: "fullname", headerName: "Full Name", minWidth: 150, flex: 1 },
    { field: "email", headerName: "Email Address", minWidth: 100, flex: 1 },
    {
      field: "status",
      headerName: "Status",
      width: 125,
      renderCell: ({ row }: { row: AccountDataType }) => {
        const status = Number(row.status) ? "Active" : "Inactive";
        return (
          <Typography variant="caption" sx={{ color: status === "Active" ? "green" : "red" }}>
            {status.toUpperCase()}
          </Typography>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 125,
      renderCell: ({ row }: { row: AdminAccountDataType }) => {
        return (
          <Tooltip title="Edit">
            <IconButton color="primary" onClick={() => handleOpenEdit(row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ];

  if (error) return <Alert severity="error">{error}</Alert>;

  const accounts =
    data?.map((item: AdminAccountDataType, index: number) => ({
      ...item,
      id: offset + index + 1,
      userId: item.userId,
    })) || [];

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <React.Suspense fallback={<CustomCircularProgress />}>
      <Typography variant="h6" color="textSecondary" letterSpacing={3} textTransform={"uppercase"} mb={1}>
        Admin User Accounts
      </Typography>

      <Box sx={{ display: "grid", gap: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
          >
            Add Admin User
          </Button>
        </Box>

        <Box sx={{ bgcolor: "background.paper", borderRadius: 4, boxShadow: 2, p: 2, overflow: "auto" }}>
          <Box sx={{ maxHeight: 400, mt: 2 }}>
            <DataGrid
              columns={columns}
              rows={accounts}
              loading={loading}
              disableRowSelectionOnClick
              hideFooterPagination
              sx={{ borderRadius: 2 }}
            />
          </Box>

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
      </Box>

      <AdminUserAddDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={handleSuccess}
        sysUsers={sysUsers}
        sysLoading={sysUsersLoading}
      />
      <AdminUserEditDialog
        open={openEdit}
        onClose={() => { setOpenEdit(false); setSelectedRow(null); }}
        data={selectedRow}
        onSuccess={handleSuccess}
        sysUsers={sysUsers}
      />
    </React.Suspense>
  );
};

export default React.memo(AdminAccounts);
