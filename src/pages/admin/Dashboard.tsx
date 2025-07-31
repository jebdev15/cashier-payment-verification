import React from 'react';
import { Alert, Box, Grid, Paper, Typography, Divider } from '@mui/material';
import { CheckCircle, HourglassEmpty, Cancel } from '@mui/icons-material';
import { useAxios } from '../../hooks/useAxios';

const Dashboard = () => {
  const { data, loading, error } = useAxios({
    url: '/api/users/dashboard',
    method: 'GET',
    authorized: true
  });

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const userStats = [
    {
      label: 'Active Users',
      value: data?.totalActiveUsers || 0,
      icon: <CheckCircle sx={{ color: 'green' }} />,
    },
    {
      label: 'Pending Users',
      value: data?.totalPendingUsers || 0,
      icon: <HourglassEmpty sx={{ color: 'goldenrod' }} />,
    },
    {
      label: 'Rejected Users',
      value: data?.totalRejectedUsers || 0,
      icon: <Cancel sx={{ color: 'red' }} />,
    },
  ];

  const transactionStats = [
    {
      label: 'Approved Transactions',
      value: data?.totalApprovedTransactions || 0,
      icon: <CheckCircle sx={{ color: 'green' }} />,
    },
    {
      label: 'Pending Transactions',
      value: data?.totalPendingTransactions || 0,
      icon: <HourglassEmpty sx={{ color: 'goldenrod' }} />,
    },
    {
      label: 'Rejected Transactions',
      value: data?.totalRejectedTransactions || 0,
      icon: <Cancel sx={{ color: 'red' }} />,
    },
  ];

  const StatCard = ({ label, value, icon }: any) => (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: '100%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <Box>{icon}</Box>
      <Box>
        <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
        <Typography variant="h6" fontWeight={600}>{value}</Typography>
      </Box>
    </Paper>
  );

  return (
    <Box px={4} py={2}>
      <Typography variant="h4" mb={3}>Dashboard</Typography>

      <Typography variant="h6" mb={1}>User Overview</Typography>
      <Grid container spacing={3} mb={4}>
        {userStats.map((stat, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="h6" mb={1}>Transaction Overview</Typography>
      <Grid container spacing={3}>
        {transactionStats.map((stat, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default React.memo(Dashboard);
