import React from "react";
import { Alert, Box, Grid, Paper, Typography, Divider } from "@mui/material";
import { CheckCircleOutlined, HourglassEmpty, CancelOutlined } from "@mui/icons-material";
import { useAxios } from "../../hooks/useAxios";
import { red, orange, green } from "@mui/material/colors";

const Dashboard = () => {
  const { data, loading, error } = useAxios({
    url: "/api/users/dashboard",
    method: "GET",
    authorized: true,
  });

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const userStats = [
    {
      label: "Active Users",
      value: data?.totalActiveUsers || 0,
      icon: <CheckCircleOutlined sx={{ color: "green" }} />,
      color: green[50],
    },
    {
      label: "Pending Users",
      value: data?.totalPendingUsers || 0,
      icon: <HourglassEmpty sx={{ color: "orange" }} />,
      color: orange[50],
    },
    {
      label: "Rejected Users",
      value: data?.totalRejectedUsers || 0,
      icon: <CancelOutlined sx={{ color: "red" }} />,
      color: red[50],
    },
  ];

  const transactionStats = [
    {
      label: "Approved Transactions",
      value: data?.totalApprovedTransactions || 0,
      icon: <CheckCircleOutlined sx={{ color: "green" }} />,
      color: green[50],
    },
    {
      label: "Pending Transactions",
      value: data?.totalPendingTransactions || 0,
      icon: <HourglassEmpty sx={{ color: "orange" }} />,
      color: orange[50],
    },
    {
      label: "Rejected Transactions",
      value: data?.totalRejectedTransactions || 0,
      icon: <CancelOutlined sx={{ color: "red" }} />,
      color: red[50],
    },
  ];

  const StatCard = ({ label, value, icon, color }: any) => (
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
