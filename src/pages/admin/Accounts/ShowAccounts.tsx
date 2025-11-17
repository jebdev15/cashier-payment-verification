import React from "react";
import { Alert, Box, IconButton, Typography, Tooltip, Pagination, Tabs, Tab } from "@mui/material";
import { Edit as EditIcon, Subject as SubjectIcon } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router";
import { AccountDataType } from "./type";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { useCookies } from "react-cookie";
import CustomCircularProgress from "@/components/CustomCircularProgress";

// Simple module-level cache keyed by "status:offset:limit"
const acctPageCache: Record<string, { items: AccountDataType[]; total: number }> = {};
const acctInflight: Record<string, Promise<{ items: AccountDataType[]; total: number }>> = {};

const ShowAccounts = () => {
  const navigate = useNavigate();
  const [cookie] = useCookies(["accessToken"]);

  // Server-side data + status/tab
  const [data, setData] = React.useState<AccountDataType[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Pagination (offset-limit)
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [totalCount, setTotalCount] = React.useState(0);
  const offset = (page - 1) * limit;

  // Tabs default to "pending"
  const [tabValue, setTabValue] = React.useState<string>("pending");
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    setPage(1); // reset when tab changes
  };

  // Fetch accounts using offset, limit, and status (tab)
  const fetchAccounts = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    const key = `${tabValue}:${offset}:${limit}`;
    // Serve from cache if available
    if (acctPageCache[key]) {
      const cached = acctPageCache[key];
      setData(cached.items);
      setTotalCount(cached.total);
      setLoading(false);
      return;
    }

    try {
      const statusParam = `&status=${encodeURIComponent(tabValue)}`;
      if (!acctInflight[key]) {
        acctInflight[key] = (async () => {
          const res = await axiosInstanceWithAuthorization(cookie.accessToken).get(
            `/api/users?offset=${offset}&limit=${limit}${statusParam}`
          );
          if (res.status !== 200) return { items: [], total: 0 };

          const resData = res.data;

          // Normalize response
          const items: AccountDataType[] = Array.isArray(resData?.data)
            ? resData.data
            : Array.isArray(resData)
              ? resData
              : [];
          const total =
            Number(resData?.total ?? 0) ||
            (Array.isArray(resData) && resData.length > 0 ? Number(resData[0]?.totalCount ?? 0) : 0) ||
            items.length;

          acctPageCache[key] = { items, total };
          return acctPageCache[key];
        })();
      }
      const { items, total } = await acctInflight[key];
      setData(items || []);
      setTotalCount(total || 0);
    } catch (e: any) {
      setError(e?.message || "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, [cookie.accessToken, offset, limit, tabValue]);

  React.useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

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

  if (error) return <Alert severity="error">{error}</Alert>;

  const accounts =
    data?.map((item: AccountDataType, index: number) => ({
      ...item,
      id: offset + index + 1,
      user_id: item.id,
    })) || [];

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <React.Suspense fallback={<CustomCircularProgress />}>
      <Typography variant="h6" color="textSecondary" letterSpacing={3} textTransform={"uppercase"} mb={1}>
        User Account Management
      </Typography>

      <Box sx={{ display: "grid", gap: 2 }}>
        {/* Tabs */}
        <Box sx={{ bgcolor: "background.paper", borderRadius: 4, boxShadow: 2, p: 2, overflow: "auto" }}>
          <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" centered>
            <Tab label="All" value="all" />
            <Tab label="Pending" value="pending" />
            <Tab label="Approved" value="approved" />
            <Tab label="Rejected" value="rejected" />
          </Tabs>

          {/* Table */}
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

          {/* Custom Pagination */}
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
    </React.Suspense>
  );
};

export default React.memo(ShowAccounts);
