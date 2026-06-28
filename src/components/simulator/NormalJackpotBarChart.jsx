import { useMemo } from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MAX_CHART_BARS_DISPLAY } from '../../simulation/constants';

const BAR_SLOT_WIDTH = 28;
const CHART_HEIGHT = 112;

function formatSpinTick(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

function BarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        累計 {point.spinAtJackpot.toLocaleString()} 回転
      </Typography>
      <Typography variant="body2">
        通常時まで: <strong>{point.normalSpins.toLocaleString()} 回</strong>
      </Typography>
      <Typography variant="body2">
        出玉: <strong>{(point.ballsWon ?? 0).toLocaleString()} 玉</strong>
      </Typography>
      {point.rushChain != null ? (
        <Typography variant="body2" color="warning.main">
          RUSH: <strong>{point.rushChain}連</strong>
        </Typography>
      ) : (
        <Typography variant="body2" color="info.main">
          <strong>単発</strong>
        </Typography>
      )}
    </Box>
  );
}

function RushBarLabel({ x, y, width, index, chartData, rushColor, singleColor }) {
  const entry = chartData[index];
  if (!entry || x == null || y == null || width == null) return null;

  const isSingle = entry.rushChain == null;
  const text = isSingle ? '単発' : `${entry.rushChain}連`;
  const fill = isSingle ? singleColor : rushColor;

  return (
    <text
      x={x + width / 2}
      y={y - 4}
      fill={fill}
      textAnchor="middle"
      fontSize={10}
      fontWeight={600}
    >
      {text}
    </text>
  );
}

function NormalJackpotBarChart({ bars, totalNormalJackpots }) {
  const theme = useTheme();
  const chartGrid = alpha(theme.palette.text.primary, 0.08);
  const chartAxis = alpha(theme.palette.text.secondary, 0.9);
  const rushColor = theme.palette.warning.main;
  const singleColor = theme.palette.info.main;

  const chartData = useMemo(() => bars.map((bar) => ({ ...bar })), [bars]);

  const chartMinWidth = Math.max(chartData.length * BAR_SLOT_WIDTH, 280);
  const trimmed = totalNormalJackpots > bars.length;

  return (
    <Box>
      <StackHeader count={totalNormalJackpots} trimmed={trimmed} />

      {chartData.length === 0 ? (
        <Box
          sx={{
            height: CHART_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            bgcolor: alpha('#000', 0.16),
            border: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            通常時大当たりが発生すると表示されます
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            width: '100%',
            overflowX: 'auto',
            borderRadius: 2,
            bgcolor: alpha('#000', 0.16),
            border: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
            p: 1,
          }}
        >
          <Box sx={{ minWidth: chartMinWidth, height: CHART_HEIGHT }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 18, right: 8, left: 0, bottom: 0 }}
                barCategoryGap="20%"
              >
                <CartesianGrid stroke={chartGrid} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="normalSpins"
                  stroke={chartAxis}
                  tick={{ fill: chartAxis, fontSize: 10 }}
                  tickFormatter={formatSpinTick}
                  interval={chartData.length > 24 ? Math.floor(chartData.length / 12) : 0}
                  label={{
                    value: '通常回転数',
                    position: 'insideBottom',
                    offset: -2,
                    fill: chartAxis,
                    fontSize: 10,
                  }}
                />
                <YAxis
                  stroke={chartAxis}
                  tick={{ fill: chartAxis, fontSize: 10 }}
                  width={36}
                  tickFormatter={formatSpinTick}
                  label={{
                    value: '通常回転',
                    angle: -90,
                    position: 'insideLeft',
                    fill: chartAxis,
                    fontSize: 10,
                  }}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: alpha(theme.palette.primary.main, 0.08) }} />
                <Bar
                  dataKey="normalSpins"
                  fill={theme.palette.primary.main}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={22}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="rushChain"
                    content={(props) => (
                      <RushBarLabel
                        {...props}
                        chartData={chartData}
                        rushColor={rushColor}
                        singleColor={singleColor}
                      />
                    )}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function StackHeader({ count, trimmed }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        mb: 1,
        gap: 1,
      }}
    >
      <Typography variant="subtitle2" fontWeight="bold">
        通常時大当たりまでの回転数
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {count > 0 ? (
          trimmed
            ? `大当たり ${count.toLocaleString()} 回（直近 ${MAX_CHART_BARS_DISPLAY} 件表示）`
            : `大当たり ${count.toLocaleString()} 回`
        ) : (
          '—'
        )}
      </Typography>
    </Box>
  );
}

export default NormalJackpotBarChart;
