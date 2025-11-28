import React from "react";
import { Box, Typography, Grid, Card, CardContent, CardHeader, Alert, Button } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { useCookies } from "react-cookie";
import CustomCircularProgress from "@/components/CustomCircularProgress";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

/**
 * System Log Page - Displays audit logs for different entities
 * 
 * Backend API Endpoints Expected:
 * - GET /api/audit-logs/user-accounts - Returns audit logs for user account changes
 * - GET /api/audit-logs/admin-users - Returns audit logs for admin user changes
 * - GET /api/audit-logs/transactions - Returns audit logs for transaction changes
 * - GET /api/audit-logs/auth-sessions - Returns audit logs for login/logout events
 * 
 * Each endpoint should return:
 * {
 *   data: [
 *     {
 *       id: number,
 *       timestamp: string (ISO format),
 *       action: string (e.g., "CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"),
 *       entityType: string (e.g., "User", "Transaction"),
 *       entityId: string | number,
 *       userId: number,
 *       userName: string (optional),
 *       details: string (optional - description of the action),
 *       ipAddress: string (optional - for auth sessions)
 *     }
 *   ]
 * }
 */

// Types for audit logs
type AuditLogEntry = {
  id: number;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string | number;
  userId: number;
  userName?: string;
  details?: string;
  ipAddress?: string;
};

type AuditLogsResponse = {
  userAccounts: AuditLogEntry[];
  adminUsers: AuditLogEntry[];
  transactions: AuditLogEntry[];
  authSessions: AuditLogEntry[];
};

// Module-level cache
let auditLogsCache: AuditLogsResponse | null = null;
let auditLogsInflight: Promise<AuditLogsResponse> | null = null;

const SystemLog = () => {
  const [{ accessToken }] = useCookies(["accessToken"]);
  const [data, setData] = React.useState<AuditLogsResponse | null>(auditLogsCache);
  const [loading, setLoading] = React.useState<boolean>(!auditLogsCache);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAuditLogs = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    if (auditLogsCache) {
      setData(auditLogsCache);
      setLoading(false);
      return;
    }

    if (!auditLogsInflight) {
      auditLogsInflight = (async () => {
        // Fetch all audit logs - adjust endpoints as needed for your backend
        const [userAccountsRes, adminUsersRes, transactionsRes, authSessionsRes] = await Promise.all([
          axiosInstanceWithAuthorization(accessToken).get("/api/audit-logs/user-accounts"),
          axiosInstanceWithAuthorization(accessToken).get("/api/audit-logs/admin-users"),
          axiosInstanceWithAuthorization(accessToken).get("/api/audit-logs/transactions"),
          axiosInstanceWithAuthorization(accessToken).get("/api/audit-logs/auth-sessions"),
        ]);

        const result: AuditLogsResponse = {
          userAccounts: userAccountsRes.data?.data || [],
          adminUsers: adminUsersRes.data?.data || [],
          transactions: transactionsRes.data?.data || [],
          authSessions: authSessionsRes.data?.data || [],
        };

        auditLogsCache = result;
        return result;
      })();
    }

    try {
      const result = await auditLogsInflight;
      setData(result);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error?.response?.data?.message || error?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const handleReload = React.useCallback(() => {
    auditLogsCache = null;
    auditLogsInflight = null;
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  React.useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  if (loading) return <CustomCircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const safeData = data || { userAccounts: [], adminUsers: [], transactions: [], authSessions: [] };

  // Common columns for all audit logs
  const baseColumns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "timestamp", headerName: "Timestamp", width: 180 },
    { field: "action", headerName: "Action", width: 150 },
    { field: "userName", headerName: "User", width: 150 },
    { field: "details", headerName: "Details", flex: 1, minWidth: 200 },
  ];

  const authColumns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "timestamp", headerName: "Timestamp", width: 180 },
    { field: "action", headerName: "Action", width: 120 },
    { field: "userName", headerName: "User", width: 150 },
    { field: "ipAddress", headerName: "IP Address", width: 150 },
    { field: "details", headerName: "Details", flex: 1, minWidth: 150 },
  ];

  return (
    <>
      <Typography variant="h6" color="textSecondary" letterSpacing={3} textTransform={"uppercase"} mb={1}>
        System Log
      </Typography>

      <Box sx={{ display: "grid", gap: 2 }}>
        {/* Reload Button */}
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

        {/* Audit Log Cards */}
        <Grid container spacing={2}>
          {/* User Accounts Audit Log */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ height: "100%", boxShadow: 2 }}>
              <CardHeader
                title="User Accounts Audit"
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
              />
              <CardContent>
                <Box sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    rows={safeData.userAccounts}
                    columns={baseColumns}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 5 } },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                    sx={{ border: 0 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Admin Users Audit Log */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ height: "100%", boxShadow: 2 }}>
              <CardHeader
                title="Admin Users Audit"
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ bgcolor: "secondary.main", color: "secondary.contrastText" }}
              />
              <CardContent>
                <Box sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    rows={safeData.adminUsers}
                    columns={baseColumns}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 5 } },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                    sx={{ border: 0 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Transactions Audit Log */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ height: "100%", boxShadow: 2 }}>
              <CardHeader
                title="Transactions Audit"
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ bgcolor: "success.main", color: "success.contrastText" }}
              />
              <CardContent>
                <Box sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    rows={safeData.transactions}
                    columns={baseColumns}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 5 } },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                    sx={{ border: 0 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Auth Sessions Audit Log */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ height: "100%", boxShadow: 2 }}>
              <CardHeader
                title="Authentication Sessions Audit"
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{ bgcolor: "info.main", color: "info.contrastText" }}
              />
              <CardContent>
                <Box sx={{ height: 400, width: "100%" }}>
                  <DataGrid
                    rows={safeData.authSessions}
                    columns={authColumns}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 5 } },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                    sx={{ border: 0 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default React.memo(SystemLog);
