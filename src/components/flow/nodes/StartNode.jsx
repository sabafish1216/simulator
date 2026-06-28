import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Paper, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import NodeShell from '../NodeShell';

function StartNode({ id, data }) {
  return (
    <NodeShell nodeId={id} nodeType="start">
      <Paper
        sx={{
          px: 2,
          py: 1,
          minWidth: 120,
          textAlign: 'center',
          bgcolor: 'background.paper',
          boxShadow: 3,
          border: 1,
          borderColor: 'success.main',
          borderRadius: 2,
        }}
      >
        <PlayArrowIcon color="success" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
        <Typography variant="body2" component="span" fontWeight="bold">
          {data.label}
        </Typography>
        <Handle type="source" position={Position.Bottom} />
      </Paper>
    </NodeShell>
  );
}

export default memo(StartNode);
