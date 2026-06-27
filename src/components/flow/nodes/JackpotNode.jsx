import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Paper, Typography, Box, Stack, useTheme } from '@mui/material';
import PayoutPieChart from '../PayoutPieChart';
import { computePieSlices } from '../../../utils/pieChart';

function JackpotNode({ data }) {
  const theme = useTheme();
  const distributions = data.distributions || [];
  const slices = computePieSlices(distributions);

  return (
    <Paper
      sx={{
        minWidth: 220,
        bgcolor: 'background.paper',
        boxShadow: 3,
        border: 1,
        borderColor: 'warning.main',
        borderRadius: 2,
        overflow: 'visible',
      }}
    >
      <Handle type="target" position={Position.Top} />

      <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
        <Typography variant="body2" fontWeight="bold" gutterBottom>
          {data.label}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <PayoutPieChart distributions={distributions} size={72} />

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {slices.map((slice) => (
              <Stack
                key={slice.id}
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ position: 'relative', py: 0.4, pr: 2 }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: slice.color,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="caption" noWrap sx={{ flexGrow: 1 }}>
                  {slice.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {slice.balls}玉
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32, textAlign: 'right' }}>
                  {slice.percent}%
                </Typography>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={slice.id}
                  className="jackpot-dist-handle"
                  style={{
                    right: -10,
                    top: '50%',
                    background: slice.color,
                    border: `2px solid ${theme.palette.background.paper}`,
                  }}
                />
              </Stack>
            ))}
            {slices.length === 0 && (
              <Typography variant="caption" color="text.secondary">
                振り分けを追加してください
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}

export default memo(JackpotNode);
