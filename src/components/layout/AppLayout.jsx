import { useState } from 'react';
import {
  AppBar,
  Box,
  Chip,
  Tab,
  Tabs,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ScienceIcon from '@mui/icons-material/Science';
import EditorPage from '../../pages/EditorPage';
import SimulatorPage from '../../pages/SimulatorPage';
import { APP_AUTHOR, APP_LICENSE, APP_VERSION } from '../../constants/appInfo';

const COPYRIGHT_YEAR = new Date().getFullYear();

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
        minHeight: 0,
      }}
    >
      {children}
    </Box>
  );
}

const TAB_ICONS = [<AccountTreeIcon key="editor" />, <ScienceIcon key="sim" />];

function AppLayout() {
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        minHeight: '100dvh',
      }}
    >
      <AppBar position="static" color="transparent">
        <Toolbar sx={{ gap: { xs: 1, sm: 2 }, minHeight: { xs: 52, sm: 64 }, px: { xs: 1.5, sm: 2 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              borderRadius: 2,
              background: (t) =>
                `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.secondary.main} 100%)`,
              boxShadow: (t) => `0 4px 16px ${t.palette.primary.main}40`,
            }}
          >
            <CasinoIcon sx={{ color: 'background.default', fontSize: { xs: 20, sm: 22 } }} />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant={isMobile ? 'subtitle1' : 'h6'} component="h1" noWrap fontWeight="bold">
              Simulate Simulator
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display={{ xs: 'none', sm: 'block' }}
            >
              パチンコシミュレーター
            </Typography>
          </Box>
          <Chip
            label={`v${APP_VERSION}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          />
        </Toolbar>
        <Box sx={{ px: { xs: 1, sm: 3 }, pb: { xs: 1, sm: 1.5 } }}>
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant={isMobile ? 'fullWidth' : 'standard'}
            sx={{
              minHeight: { xs: 48, sm: 44 },
              '& .MuiTabs-flexContainer': {
                gap: isMobile ? 0 : 0.5,
              },
            }}
          >
            <Tab
              icon={TAB_ICONS[0]}
              iconPosition={isMobile ? 'top' : 'start'}
              label={isMobile ? 'エディタ' : 'フローエディタ'}
              sx={{ minHeight: { xs: 56, sm: 40 }, py: isMobile ? 1 : undefined }}
            />
            <Tab
              icon={TAB_ICONS[1]}
              iconPosition={isMobile ? 'top' : 'start'}
              label="シミュレーション"
              sx={{ minHeight: { xs: 56, sm: 40 }, py: isMobile ? 1 : undefined }}
            />
          </Tabs>
        </Box>
      </AppBar>

      <TabPanel value={tab} index={0}>
        <EditorPage />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <SimulatorPage />
      </TabPanel>

      <Box
        component="footer"
        sx={{
          flexShrink: 0,
          py: 1,
          px: 2,
          textAlign: 'center',
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: (t) => t.palette.background.paper,
          pb: 'max(8px, env(safe-area-inset-bottom))',
        }}
      >
        <Typography variant="caption" color="text.secondary" display="block">
          © {COPYRIGHT_YEAR} {APP_AUTHOR} · v{APP_VERSION}
        </Typography>
        <Typography variant="caption" color="text.disabled" display="block">
          Licensed under the {APP_LICENSE} License
        </Typography>
      </Box>
    </Box>
  );
}

export default AppLayout;
