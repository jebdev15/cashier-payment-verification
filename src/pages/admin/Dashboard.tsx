import React from 'react';
import { Paper, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: (theme?.vars ?? theme).palette.text.secondary,
  flexGrow: 1,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

const Dashboard = () => {
  return (
    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
      <Item>Pending 1</Item>
      <Item>Pending 2</Item>
      <Item>Pending 2</Item>
      <Item>Pending 2</Item>
      <Item>Pending 2</Item>
      <Item>Pending 2</Item>
      <Item>Pending 2</Item>
      <Item>Pending 2</Item>
    </Stack>
  )
}

export default React.memo(Dashboard)