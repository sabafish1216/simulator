import {
  Box,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { formatMeasuredProb, formatPercent, formatYen } from '../../simulation/constants';

function MetricRow({ label, value, sub }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        {sub && (
          <Typography variant="caption" color="text.disabled">
            {sub}
          </Typography>
        )}
      </Box>
      <Typography variant="body2" fontWeight="bold" textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}

function StatCard({ title, value, subtitle, accent = 'primary' }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          bgcolor: `${accent}.main`,
        },
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" fontWeight="bold">
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
}

function LossLimitProgress({ netYen, maxLossYen }) {
  const theme = useTheme();
  if (maxLossYen == null) return null;

  const used = Math.max(0, -netYen);
  const remaining = Math.max(0, maxLossYen + netYen);
  const percent = Math.min(100, (used / maxLossYen) * 100);
  const reached = netYen <= -maxLossYen;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          上限金額までの余裕
        </Typography>
        <Typography
          variant="body2"
          fontWeight="bold"
          color={reached ? 'error.main' : 'text.primary'}
        >
          残り {formatYen(remaining)}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percent}
        color={reached ? 'error' : percent > 75 ? 'warning' : 'primary'}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: alpha(theme.palette.error.main, 0.12),
        }}
      />
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75 }}>
        <Typography variant="caption" color="text.secondary">
          現在の収支 {formatYen(netYen, { signed: true })}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          上限 -{maxLossYen.toLocaleString()} 円
        </Typography>
      </Stack>
    </Paper>
  );
}

function SimulatorStatsPanel({ snapshot }) {
  const netYen = snapshot.netYen;
  const payoutRate =
    snapshot.investmentYen > 0 ? snapshot.prizeYen / snapshot.investmentYen : null;
  const avgJackpotCost =
    snapshot.jackpotCount > 0 ? snapshot.investmentYen / snapshot.jackpotCount : null;
  const spinsPer1000YenInvested =
    snapshot.ballsUsed > 0 ? (snapshot.spinCount / snapshot.ballsUsed) * 250 : null;
  const ballDiff = snapshot.ballsWon - snapshot.ballsUsed;

  return (
    <Stack spacing={3}>
      <LossLimitProgress netYen={netYen} maxLossYen={snapshot.maxLossYen} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="累計回転"
            value={`${snapshot.spinCount.toLocaleString()} 回`}
            subtitle={`通常 ${snapshot.normalSpins.toLocaleString()} / RUSH ${snapshot.rushSpins.toLocaleString()}`}
            accent="primary"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="大当たり"
            value={`${snapshot.jackpotCount.toLocaleString()} 回`}
            subtitle={
              snapshot.jackpotCount > 0
                ? `平均投資 ${formatYen(avgJackpotCost)} / 回`
                : '—'
            }
            accent="warning"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="収支"
            value={formatYen(netYen, { signed: true })}
            subtitle={`最大ドローダウン ${formatYen(snapshot.minNetYen, { signed: true })}`}
            accent={netYen >= 0 ? 'success' : 'error'}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            title="機械割"
            value={payoutRate != null ? formatPercent(payoutRate) : '—'}
            subtitle={
              payoutRate != null
                ? `換金 ${formatYen(snapshot.prizeYen)} / 投資 ${formatYen(snapshot.investmentYen)}`
                : '投資なし'
            }
            accent="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              大当たり内訳
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="warning.main" sx={{ mb: 2 }}>
              {snapshot.jackpotCount.toLocaleString()} 回
            </Typography>
            <Stack spacing={1.25}>
              {snapshot.jackpotBreakdown.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  大当たりなし
                </Typography>
              ) : (
                snapshot.jackpotBreakdown.map((item) => (
                  <MetricRow
                    key={item.type}
                    label={item.label}
                    value={`${item.count.toLocaleString()} 回`}
                    sub={
                      snapshot.jackpotCount > 0
                        ? `${((item.count / snapshot.jackpotCount) * 100).toFixed(1)}%`
                        : undefined
                    }
                  />
                ))
              )}
              <Divider />
              <MetricRow
                label="通常時（通常・時短）"
                value={`${snapshot.normalJackpots.toLocaleString()} 回`}
              />
              <MetricRow
                label="RUSH中（RUSH・転落式）"
                value={`${snapshot.rushJackpots.toLocaleString()} 回`}
              />
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              大当たり確率（実測）
            </Typography>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  通常時
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatMeasuredProb(snapshot.normalSpins, snapshot.normalJackpots)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {snapshot.normalSpins.toLocaleString()} 回転中{' '}
                  {snapshot.normalJackpots.toLocaleString()} 回当選
                  {snapshot.normalJackpots > 0 && (
                    <>
                      {' '}
                      （約 {formatYen(snapshot.investmentYen / snapshot.normalJackpots)} / 回）
                    </>
                  )}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  RUSH中
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatMeasuredProb(snapshot.rushSpins, snapshot.rushJackpots)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {snapshot.rushSpins.toLocaleString()} 回転中{' '}
                  {snapshot.rushJackpots.toLocaleString()} 回当選
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          投資・換金の詳細
        </Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="投資額"
              value={formatYen(snapshot.investmentYen)}
              subtitle={`${snapshot.investmentBuckets} 回 × 500円 / 使用 ${Math.round(snapshot.ballsUsed).toLocaleString()} 玉`}
              accent="error"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="賞金額（換金）"
              value={formatYen(snapshot.prizeYen)}
              subtitle={`獲得 ${Math.round(snapshot.ballsWon).toLocaleString()} 玉`}
              accent="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="差玉"
              value={`${ballDiff >= 0 ? '+' : ''}${Math.round(ballDiff).toLocaleString()} 玉`}
              subtitle={
                spinsPer1000YenInvested != null
                  ? `実測 ${spinsPer1000YenInvested.toFixed(1)} 回転 / 1000円投資`
                  : undefined
              }
              accent={ballDiff >= 0 ? 'success' : 'warning'}
            />
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
}

export default SimulatorStatsPanel;
