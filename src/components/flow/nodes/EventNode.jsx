import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Paper, Typography, Chip, Box } from '@mui/material';
import { EVENT_TYPE_OPTIONS } from '../../../constants/nodeDefaults';

function EventNode({ data }) {
  const eventLabel =
    EVENT_TYPE_OPTIONS.find((o) => o.value === data.eventType)?.label ?? data.eventType;

  return (
    <Paper
      sx={{
        px: 2,
        py: 1.5,
        minWidth: 140,
        bgcolor: 'background.paper',
        boxShadow: 3,
        border: 1,
        borderColor: 'secondary.main',
        borderRadius: 2,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Typography variant="body2" fontWeight="bold" gutterBottom>
        {data.label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        <Chip label={eventLabel} size="small" color="secondary" variant="outlined" />
        <Chip label={`1/${data.probability}`} size="small" variant="outlined" />
      </Box>
      <Handle type="source" position={Position.Bottom} />
    </Paper>
  );
}

export default memo(EventNode);
