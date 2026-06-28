import { Box } from '@mui/material';
import NodeActionButton from './NodeActionButton';

function NodeShell({ nodeId, nodeType, children }) {
  const deletable = nodeType !== 'start';

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <NodeActionButton nodeId={nodeId} deletable={deletable} />
    </Box>
  );
}

export default NodeShell;
