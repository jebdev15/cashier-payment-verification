import React from "react";
import { Alert, Box, IconButton, Typography, Tooltip, Pagination, Button } from "@mui/material";
import { Edit as EditIcon, Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { AccountDataType, AdminAccountDataType } from "./type";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { useCookies } from "react-cookie";
import CustomCircularProgress from "@/components/CustomCircularProgress";
import { formatAccessLevel } from "@/utils/formatAccessLevel";
import AdminUserAddDialog from "@/components/modals/admin/AdminUserAddDialog";
import AdminUserEditDialog from "@/components/modals/admin/AdminUserEditDialog";
import { useSysUsersCache } from "@/hooks/useSysUsersCache";
import { formatAdminDepartment } from "@/utils/formatAdminDepartment";

// Simple module-level cache keyed by "offset:limit"
const adminUsersPageCache: Record<string, { items: AdminAccountDataType[]; total: number }> = {};
const adminUsersInflight: Record<string, Promise<{ items: AdminAccountDataType[]; total: number }>> = {};

const AdminAccounts = () => {
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
    const { data: sysUsers, loading: sysUsersLoading, refresh: refreshSysUsers } = useSysUsersCache();
    // Fetch accounts using offset, limit with cache
    const fetchAccounts = React.useCallback(async () => {
        const key = `${offset}:${limit}`;
        // Serve from cache if available
        if (adminUsersPageCache[key]) {
            const cached = adminUsersPageCache[key];
            setData(cached.items);
            setTotalCount(cached.total);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Reuse inflight request if any
            if (!adminUsersInflight[key]) {
                adminUsersInflight[key] = (async () => {
                    const res = await axiosInstanceWithAuthorization(cookie.accessToken).get(
                        `/api/admin-users?offset=${offset}&limit=${limit}`
                    );
                    if (res.status !== 200) {
                        return { items: [], total: 0 };
                    }

                    const resData = res.data;
                    // Normalize response
                    const items: AdminAccountDataType[] = Array.isArray(resData?.data?.items)
                        ? resData.data.items
                        : [];
                    const total = Number(resData?.data?.total ?? 0);

                    // Save to cache
                    adminUsersPageCache[key] = { items, total };
                    return adminUsersPageCache[key];
                })();
            }

            const { items, total } = await adminUsersInflight[key];
            setData(items);
            setTotalCount(total);
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
        // invalidate table cache and refetch
        Object.keys(adminUsersPageCache).forEach((k) => delete adminUsersPageCache[k]);
        Object.keys(adminUsersInflight).forEach((k) => delete adminUsersInflight[k]);
        fetchAccounts();
        // refresh cached sys users as well (in case list changed)
        refreshSysUsers();
    };

    // ✅ Manual reload function
    const handleReload = React.useCallback(() => {
        // Clear cache
        Object.keys(adminUsersPageCache).forEach((k) => delete adminUsersPageCache[k]);
        Object.keys(adminUsersInflight).forEach((k) => delete adminUsersInflight[k]);
        // Refetch current page
        fetchAccounts();
        // Also refresh sys users cache
        refreshSysUsers();
    }, [fetchAccounts, refreshSysUsers]);

    const columns = [
        { field: "id", headerName: "No.", width: 100 },
        { field: "fullname", headerName: "Full Name", minWidth: 150, flex: 1 },
        {
            field: "accessLevel",
            headerName: "Role",
            minWidth: 50,
            flex: 1,
            renderCell: ({ row }: { row: AdminAccountDataType }) => {
                return formatAccessLevel(row.accessLevel);
            }
        },
        {
            field: "department",
            headerName: "Department",
            minWidth: 100,
            flex: 1,
            renderCell: ({ row }: { row: AdminAccountDataType }) => {
                return formatAdminDepartment(row.department ?? 0);
            }
        },
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
                    {/* ✅ Add Reload Button */}
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={handleReload}
                        disabled={loading}
                    >
                        Reload
                    </Button>
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
                    <Box sx={{ mt: 2 }}>
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
