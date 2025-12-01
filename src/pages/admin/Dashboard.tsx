import React from "react";
import { Alert, Box, Grid, Typography, Button } from "@mui/material";
import { CheckCircleOutlined, HourglassEmpty, CancelOutlined, Refresh as RefreshIcon } from "@mui/icons-material";
import { axiosInstanceWithAuthorization } from "@/api/app";
import { useCookies } from "react-cookie";
import { red, orange, green } from "@mui/material/colors";

// Types
type DashboardData = {
  totalActiveUsers?: number;
  totalPendingUsers?: number;
  totalRejectedUsers?: number;
  totalApprovedTransactions?: number;
  totalPendingTransactions?: number;
  totalRejectedTransactions?: number;
};

// Module-level cache + inflight promise for dashboard
let dashboardCache: DashboardData | null = null;
let dashboardInflight: Promise<DashboardData> | null = null;

const Dashboard = () => {
  const [{ accessToken }] = useCookies(["accessToken"]);
  const [data, setData] = React.useState<DashboardData | null>(dashboardCache);
  const [loading, setLoading] = React.useState<boolean>(!dashboardCache);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      if (dashboardCache) {
        setData(dashboardCache);
        setLoading(false);
        return;
      }

      if (!dashboardInflight) {
        dashboardInflight = (async () => {
          const res = await axiosInstanceWithAuthorization(accessToken).get("/api/users/dashboard");
          if (res.status === 200) {
            dashboardCache = res.data;
            return dashboardCache as DashboardData;
          }
          throw new Error("Failed to load dashboard");
        })();
      }

      try {
        const result = await dashboardInflight;
        if (cancelled) return;
        setData(result);
      } catch (err) {
        if (cancelled) return;
        const error = err as { message?: string };
        setError(error?.message || "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  // Optional refresh helper (not used in UI currently)
  const refreshDashboard = React.useCallback(() => {
    dashboardCache = null;
    dashboardInflight = null;
    setLoading(true);
    setError(null);
    // trigger effect by setting loading (effect reads cache/inflight)
    // call fetch immediately to update state
    (async () => {
      try {
        const res = await axiosInstanceWithAuthorization(accessToken).get("/api/users/dashboard");
        if (res.status === 200) {
          dashboardCache = res.data;
          setData(res.data);
        }
      } catch (err) {
        const error = err as { message?: string };
        setError(error?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const safeData = data || {};
  const userStats = [
    {
      label: "Active Users",
      value: safeData?.totalActiveUsers || 0,
      icon: <CheckCircleOutlined sx={{ color: "green" }} />,
      color: green[50],
    },
    {
      label: "Pending Users",
      value: safeData?.totalPendingUsers || 0,
      icon: <HourglassEmpty sx={{ color: "orange" }} />,
      color: orange[50],
    },
    {
      label: "Rejected Users",
      value: safeData?.totalRejectedUsers || 0,
      icon: <CancelOutlined sx={{ color: "red" }} />,
      color: red[50],
    },
  ];

  const transactionStats = [
    {
      label: "Approved Transactions",
      value: safeData?.totalApprovedTransactions || 0,
      icon: <CheckCircleOutlined sx={{ color: "green" }} />,
      color: green[50],
    },
    {
      label: "Pending Transactions",
      value: safeData?.totalPendingTransactions || 0,
      icon: <HourglassEmpty sx={{ color: "orange" }} />,
      color: orange[50],
    },
    {
      label: "Rejected Transactions",
      value: safeData?.totalRejectedTransactions || 0,
      icon: <CancelOutlined sx={{ color: "red" }} />,
      color: red[50],
    },
  ];

  type StatCardProps = {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  };

  const StatCard = ({ label, value, icon, color }: StatCardProps) => (
    <Box
      sx={{
        py: 3,
        px: 4,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        height: "100%",
        bgcolor: color,
      }}
    >
      <Box sx={{ "& > *": { aspectRatio: "1 / 1", width: "auto !important", height: "auto !important" }, aspectRatio: "1 / 1", ml: -0.65, mb: 0.5 }}>{icon}</Box>
      <Typography variant="h5" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );

  return (
    <>
      <Typography variant="h6" color="textSecondary" letterSpacing={3} textTransform={"uppercase"} mb={1}>
        Dashboard
      </Typography>

      <Box sx={{ display: "grid", gap: 2 }}>
        {/* Reload Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={refreshDashboard}
            disabled={loading}
          >
            Reload
          </Button>
        </Box>
        <Box sx={{ bgcolor: "background.paper", borderRadius: 4, boxShadow: 2, p: 2 }}>
          <Typography variant="h6" mb={2}>
            User Overview
          </Typography>
          <Grid container spacing={2}>
            {userStats.map((stat, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <StatCard {...stat} />
              </Grid>
            ))}
          </Grid>
        </Box>
        <Box sx={{ bgcolor: "background.paper", borderRadius: 4, boxShadow: 2, p: 2 }}>
          <Typography variant="h6" mb={2}>
            Transaction Overview
          </Typography>
          <Grid container spacing={2}>
            {transactionStats.map((stat, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <StatCard {...stat} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default React.memo(Dashboard);
