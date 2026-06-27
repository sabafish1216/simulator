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

          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              display: 'grid',
              gridTemplateColumns: '8px max-content auto auto',
              columnGap: 1,
              rowGap: 0.4,
              alignItems: 'center',
            }}
          >
            {slices.map((slice) => (
              <Box key={slice.id} sx={{ display: 'contents' }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: slice.color,
                    justifySelf: 'center',
                  }}
                />
                <Typography variant="caption" noWrap>
                  {slice.label}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
                >
                  {slice.balls}玉
                </Typography>
                <Box sx={{ position: 'relative', pr: 2, justifySelf: 'end' }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ minWidth: 32, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
                  >
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
                </Box>
              </Box>
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
