import { useState } from 'react';
import {
  AppBar,
  Box,
  Chip,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ScienceIcon from '@mui/icons-material/Science';
import EditorPage from '../../pages/EditorPage';
import SimulatorPage from '../../pages/SimulatorPage';

function TabPanel({ children, value, index }) {
  if (value !== index) return null;
  return (
    <Box
      role="tabpanel"
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}

const TAB_ICONS = [<AccountTreeIcon key="editor" />, <ScienceIcon key="sim" />];

function AppLayout() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="transparent">
        <Toolbar sx={{ gap: 2, minHeight: { xs: 56, sm: 64 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              background: (t) =>
                `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.secondary.main} 100%)`,
              boxShadow: (t) => `0 4px 16px ${t.palette.primary.main}40`,
            }}
          >
            <CasinoIcon sx={{ color: 'background.default', fontSize: 22 }} />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" component="h1" noWrap>
              Simulate Simulator
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              パチンコシミュレーター
            </Typography>
          </Box>
          <Chip
            label="Beta"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          />
        </Toolbar>
        <Box sx={{ px: { xs: 1.5, sm: 3 }, pb: 1.5 }}>
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            sx={{
              minHeight: 44,
              '& .MuiTabs-flexContainer': {
                gap: 0.5,
              },
            }}
          >
            <Tab icon={TAB_ICONS[0]} iconPosition="start" label="フローエディタ" />
            <Tab icon={TAB_ICONS[1]} iconPosition="start" label="シミュレーション" />
          </Tabs>
        </Box>
      </AppBar>

      <TabPanel value={tab} index={0}>
        <EditorPage />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <SimulatorPage />
      </TabPanel>
    </Box>
  );
}

export default AppLayout;
