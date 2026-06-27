import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import AppLayout from './components/layout/AppLayout';
import FlowMigration from './components/FlowMigration';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FlowMigration />
      <AppLayout />
    </ThemeProvider>
  );
}

export default App;
