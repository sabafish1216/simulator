import { useMediaQuery, useTheme } from '@mui/material';

/** md 未満（タブレット縦・スマホ） */
export default function useIsMobile() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'));
}
