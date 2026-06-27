import { Box, Stack, Typography, alpha, useTheme } from '@mui/material';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatYen } from '../../simulation/constants';
import useIsMobile from '../../hooks/useIsMobile';

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        minWidth: 180,
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        累計 {Number(label).toLocaleString()} 回転
      </Typography>
      <Typography variant="body2">
        収支: <strong>{formatYen(point.netYen ?? 0, { signed: true })}</strong>
      </Typography>
      <Typography variant="body2">
        差玉: <strong>{Number(point.diff ?? 0).toLocaleString()} 玉</strong>
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
        投資 {formatYen(point.investmentYen ?? 0)} / 換金 {formatYen(point.prizeYen ?? 0)}
      </Typography>
    </Box>
  );
}

function SimulatorTrendChart({ trend, spinCount, maxLossYen }) {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const chartGrid = alpha(theme.palette.text.primary, 0.08);
  const chartAxis = alpha(theme.palette.text.secondary, 0.9);
  const chartHeight = isMobile ? 240 : 360;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        flexWrap="wrap"
        gap={1}
        sx={{ mb: 2 }}
      >
        <Typography variant={isMobile ? 'subtitle2' : 'subtitle1'} fontWeight="bold">
          出玉・収支トレンド
        </Typography>
        <Typography variant="caption" color="text.secondary">
          累計 {spinCount.toLocaleString()} 回転（RUSH含む）
        </Typography>
      </Stack>

      <Box
        sx={{
          width: '100%',
          height: chartHeight,
          borderRadius: 2,
          bgcolor: alpha('#000', 0.2),
          border: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
          p: 1,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trend} margin={{ top: 8, right: 4, left: 0, bottom: 4 }}>
            <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
            <XAxis
              dataKey="index"
              type="number"
              scale="linear"
              domain={['dataMin', 'dataMax']}
              allowDataOverflow
              stroke={chartAxis}
              tick={{ fill: chartAxis, fontSize: 11 }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
            />
            <YAxis
              yAxisId="balls"
              stroke={chartAxis}
              tick={{ fill: chartAxis, fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              label={{
                value: '差玉（玉）',
                angle: -90,
                position: 'insideLeft',
                fill: chartAxis,
                fontSize: 11,
              }}
            />
            <YAxis
              yAxisId="yen"
              orientation="right"
              stroke={theme.palette.secondary.main}
              tick={{ fill: theme.palette.secondary.main, fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              label={{
                value: '収支（円）',
                angle: 90,
                position: 'insideRight',
                fill: theme.palette.secondary.main,
                fontSize: 11,
              }}
            />
            <Tooltip content={<TrendTooltip />} />
            <Legend
              verticalAlign="top"
              height={28}
              formatter={(value) =>
                value === 'netYen' ? '収支（円）' : '差玉（玉）'
              }
            />
            <ReferenceLine
              yAxisId="balls"
              y={0}
              stroke={alpha(theme.palette.text.primary, 0.2)}
              strokeDasharray="4 4"
            />
            <ReferenceLine
              yAxisId="yen"
              y={0}
              stroke={alpha(theme.palette.secondary.main, 0.4)}
              strokeDasharray="4 4"
            />
            {maxLossYen != null && (
              <ReferenceLine
                yAxisId="yen"
                y={-maxLossYen}
                stroke={theme.palette.error.main}
                strokeDasharray="6 4"
                label={{
                  value: `上限 -${maxLossYen.toLocaleString()}円`,
                  position: 'insideTopRight',
                  fill: theme.palette.error.main,
                  fontSize: 11,
                }}
              />
            )}
            <Line
              yAxisId="yen"
              type="monotone"
              dataKey="netYen"
              name="netYen"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              yAxisId="balls"
              type="monotone"
              dataKey="diff"
              name="diff"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}

export default SimulatorTrendChart;
