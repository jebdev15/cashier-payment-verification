import Chip from '@mui/material/Chip';
import { styled } from '@mui/material/styles';

export const CustomChip = styled(Chip)(({ theme, color }) => {
  // Handle default color as gray
  if (color === 'default' || !color) {
    return {
      backgroundColor: theme.palette.grey[200],
      color: theme.palette.text.secondary,
    };
  }
  
  // For other colors, let MUI handle it naturally
  return {};
});