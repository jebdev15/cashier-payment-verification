import React from 'react';
import { Snackbar, Alert, SnackbarOrigin } from '@mui/material';

interface SnackbarProviderProps {
  open: boolean;
  message: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
  duration?: number; // autoHideDuration in ms
  onClose: () => void;
  vertical?: SnackbarOrigin['vertical'];
  horizontal?: SnackbarOrigin['horizontal'];
}

const SnackbarProvider: React.FC<SnackbarProviderProps> = ({
  open,
  message,
  severity = 'info',
  duration = 4000,
  onClose,
  vertical = 'bottom',
  horizontal = 'center',
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={(_, reason) => {
        if (reason === 'clickaway') return;
        onClose();
      }}
      anchorOrigin={{ vertical, horizontal }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarProvider;
