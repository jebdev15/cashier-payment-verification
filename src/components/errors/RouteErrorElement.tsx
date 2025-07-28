import { useRouteError, isRouteErrorResponse } from 'react-router';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function RouteErrorElement() {
  const error = useRouteError();
  console.error(error);

  const errorMessage = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : (error as Error)?.message || 'An unexpected error occurred.';

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
        <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Oops! Something went wrong
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {errorMessage}
        </Typography>
        <Button variant="contained" color="error" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </Paper>
    </Container>
  );
}
