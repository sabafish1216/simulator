import { Box, Chip, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BoltIcon from '@mui/icons-material/Bolt';
import ErrorIcon from '@mui/icons-material/Error';
import StopIcon from '@mui/icons-material/Stop';

const STATE_CHIP_COLOR = {
  normal: 'primary',
  short: 'info',
  rush: 'warning',
  rush_fall: 'error',
};

const PHASE_CONFIG = {
  state: { icon: CircleIcon, color: 'primary.main' },
  jackpot: { icon: EmojiEventsIcon, color: 'warning.main' },
  event: { icon: BoltIcon, color: 'secondary.main' },
  error: { icon: ErrorIcon, color: 'error.main' },
  stopped: { icon: StopIcon, color: 'text.secondary' },
  idle: { icon: CircleIcon, color: 'text.disabled' },
};

function CurrentStateIndicator({ status, running }) {
  const theme = useTheme();
  const phase = status?.phase ?? 'idle';
  const config = PHASE_CONFIG[phase] ?? PHASE_CONFIG.idle;
  const Icon = config.icon;

  const stateChipColor = status?.stateType
    ? STATE_CHIP_COLOR[status.stateType] ?? 'default'
    : 'default';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 0,
        borderLeft: 4,
        borderLeftColor: config.color,
        bgcolor: running
          ? alpha(theme.palette.primary.main, 0.08)
          : alpha(theme.palette.background.paper, 0.9),
        boxShadow: running ? `0 0 24px ${alpha(theme.palette.primary.main, 0.1)}` : 'none',
        transition: 'background-color 0.2s, box-shadow 0.2s',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 120 }}>
          <Icon sx={{ color: config.color, fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
            現在の状態
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
          {status?.stateTypeLabel && (
            <Chip
              label={status.stateTypeLabel}
              size="small"
              color={stateChipColor}
              variant="filled"
            />
          )}
          {status?.nodeTypeLabel && !status.stateTypeLabel && (
            <Chip label={status.nodeTypeLabel} size="small" variant="outlined" />
          )}
          <Typography variant="body1" fontWeight="bold">
            {status?.label ?? '—'}
          </Typography>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
          {status?.spinsTotal != null && (
            <Chip
              label={`${status.spinsDone} / ${status.spinsTotal} 回転`}
              size="small"
              variant="outlined"
            />
          )}
          {status?.freeSpin && (
            <Chip label="玉消費なし" size="small" color="success" variant="outlined" />
          )}
          {running && (
            <Chip label="実行中" size="small" color="success" variant="filled" />
          )}
          {!running && phase === 'stopped' && (
            <Chip
              label={status?.stoppedReason === 'loss_limit' ? '上限到達' : '停止中'}
              size="small"
              color={status?.stoppedReason === 'loss_limit' ? 'warning' : 'default'}
              variant="outlined"
            />
          )}
          {phase === 'error' && (
            <Chip label="エラー" size="small" color="error" />
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

export default CurrentStateIndicator;
