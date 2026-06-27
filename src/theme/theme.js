import { alpha, createTheme } from '@mui/material/styles';

const palette = {
  mode: 'dark',
  primary: {
    main: '#7c9cff',
    light: '#a8bfff',
    dark: '#5b7de8',
    contrastText: '#0a0c12',
  },
  secondary: {
    main: '#f5b942',
    light: '#ffd06a',
    dark: '#c9922a',
    contrastText: '#0a0c12',
  },
  success: {
    main: '#3dd68c',
    light: '#6ee7a8',
    dark: '#22a86a',
  },
  warning: {
    main: '#ffb547',
    light: '#ffcc7a',
    dark: '#e09220',
  },
  error: {
    main: '#ff6b7a',
    light: '#ff95a0',
    dark: '#e04556',
  },
  info: {
    main: '#5ec8ff',
  },
  background: {
    default: '#0a0c12',
    paper: '#141824',
  },
  text: {
    primary: '#eef1f8',
    secondary: alpha('#eef1f8', 0.62),
    disabled: alpha('#eef1f8', 0.38),
  },
  divider: alpha('#eef1f8', 0.08),
  action: {
    hover: alpha('#eef1f8', 0.06),
    selected: alpha('#7c9cff', 0.14),
    disabledBackground: alpha('#eef1f8', 0.08),
  },
};

const theme = createTheme({
  palette,
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      '"Inter"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, letterSpacing: '0.02em' },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shadows: [
    'none',
    `0 1px 2px ${alpha('#000', 0.35)}`,
    `0 4px 12px ${alpha('#000', 0.28)}`,
    `0 8px 24px ${alpha('#000', 0.32)}`,
    ...Array(21).fill(`0 12px 40px ${alpha('#000', 0.4)}`),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, ${alpha(
            palette.primary.main,
            0.14,
          )}, transparent)`,
          backgroundAttachment: 'fixed',
        },
        '*::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: alpha('#eef1f8', 0.16),
          borderRadius: 8,
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: alpha('#eef1f8', 0.24),
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${alpha('#eef1f8', 0.08)}`,
        },
        outlined: {
          borderColor: alpha('#eef1f8', 0.1),
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: alpha(palette.background.paper, 0.72),
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${alpha('#eef1f8', 0.08)}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${palette.primary.main} 0%, ${palette.primary.dark} 100%)`,
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${palette.secondary.main} 0%, ${palette.secondary.dark} 100%)`,
          color: palette.secondary.contrastText,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 10,
          marginRight: 4,
          fontWeight: 600,
          color: palette.text.secondary,
          '&.Mui-selected': {
            color: palette.text.primary,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#000', 0.2),
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha('#eef1f8', 0.2),
          },
        },
        notchedOutline: {
          borderColor: alpha('#eef1f8', 0.12),
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        outlined: {
          borderColor: alpha('#eef1f8', 0.16),
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginInline: 8,
          marginBlock: 2,
          '&.Mui-selected': {
            backgroundColor: alpha(palette.primary.main, 0.14),
            '&:hover': {
              backgroundColor: alpha(palette.primary.main, 0.2),
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          border: `1px solid ${alpha('#eef1f8', 0.08)}`,
        },
        standardInfo: {
          backgroundColor: alpha(palette.info.main, 0.1),
        },
        standardError: {
          backgroundColor: alpha(palette.error.main, 0.1),
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: alpha('#eef1f8', 0.08),
        },
      },
    },
  },
});

export default theme;
