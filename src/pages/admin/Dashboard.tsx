import React from 'react'
import { Alert, Box, Grid, Typography } from '@mui/material'
import { useAxios } from '../../hooks/useAxios'

const Dashboard = () => {
  const { data, loading, error } = useAxios({
    url: '/api/users/dashboard',
    method: 'GET',
    authorized: true
  })
  if (loading) return <p>Loading...</p>;
  if (error) return <Alert severity="error">{error}</Alert>;
  return (
    <Box sx={{ flexGrow: 1, paddingX: 4, paddingY: 2, height: "100%" }}>
      <Typography
        variant="h4"
        color="initial"
        sx={{ marginBottom: 2 }}
      >
        Dashboard
      </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }} sx={{ bgcolor: 'background.paper', padding: 2, textAlign: "center", minHeight: 100, boxShadow: "inset 0 -1px 0 0 rgb(0 0 0 / 8%)" }}>
              <Typography variant="h5" color="initial">
                {data?.totalActiveUsers > 1 ? "Total Active Users" : "Total Active User"}
              </Typography>
              <Typography variant="h6" color="initial">
                {data?.totalActiveUsers}
              </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ bgcolor: 'background.paper', padding: 2, textAlign: "center", minHeight: 100, boxShadow: "inset 0 -1px 0 0 rgb(0 0 0 / 8%)" }}>
              <Typography variant="h5" color="initial">
                {data?.totalPendingUsers > 1 ? "Total Pending Users" : "Total Pending User"}
              </Typography>
              <Typography variant="h6" color="initial">
                {data?.totalPendingUsers}
              </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ bgcolor: 'background.paper', padding: 2, textAlign: "center", minHeight: 100, boxShadow: "inset 0 -1px 0 0 rgb(0 0 0 / 8%)" }}>
              <Typography variant="h6" color="initial">
                {data?.totalRejectedUsers > 1 ? "Total Rejected Users" : "Total Rejected User"}
              </Typography>
              <Typography variant="body1" color="initial">
                {data?.totalRejectedUsers}
              </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ marginTop: 2 }}>
          <Grid size={{ xs: 12, md: 4 }} sx={{ bgcolor: 'background.paper', padding: 2, textAlign: "center", minHeight: 100 }}>
              <Typography variant="h5" color="initial">
                {data?.totalApprovedTransactions > 1 ? "Total Approved Transactions" : "Total Approved Transaction"}
              </Typography>
              <Typography variant="h6" color="initial">
                {data?.totalApprovedTransactions}
              </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ bgcolor: 'background.paper', padding: 2, textAlign: "center", minHeight: 100 }}>
              <Typography variant="h5" color="initial">
                {data?.totalPendingTransactions > 1 ? "Total Pending Transactions" : "Total Pending Transaction"}
              </Typography>
              <Typography variant="h6" color="initial">
                {data?.totalPendingTransactions}
              </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ bgcolor: 'background.paper', padding: 2, textAlign: "center", minHeight: 100 }}>
              <Typography variant="h5" color="initial">
                {data?.totalRejectedTransactions > 1 ? "Total Rejected Transactions" : "Total Rejected Transaction"}
              </Typography>
              <Typography variant="h6" color="initial">
                {data?.totalRejectedTransactions}
              </Typography>
          </Grid>
        </Grid>
    </Box>
  )
}

export default React.memo(Dashboard)