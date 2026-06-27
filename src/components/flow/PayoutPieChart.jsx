import { Box, Typography, useTheme } from '@mui/material';
import { computePieSlices, describeArc } from '../../utils/pieChart';

function PayoutPieChart({ distributions, size = 80 }) {
  const theme = useTheme();
  const slices = computePieSlices(distributions);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;

  if (slices.length === 0) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          -
        </Typography>
      </Box>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((slice) => (
        <path
          key={slice.id}
          d={describeArc(cx, cy, r, slice.startAngle, slice.endAngle)}
          fill={slice.color}
          stroke={theme.palette.background.paper}
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}

export default PayoutPieChart;
