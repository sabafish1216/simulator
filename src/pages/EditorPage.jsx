import { Box } from '@mui/material';
import FlowEditor from '../components/flow/FlowEditor';

function EditorPage() {
  return (
    <Box sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
      <FlowEditor />
    </Box>
  );
}

export default EditorPage;
