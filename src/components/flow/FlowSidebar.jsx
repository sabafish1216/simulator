import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CircleIcon from '@mui/icons-material/Circle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BoltIcon from '@mui/icons-material/Bolt';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useDispatch } from 'react-redux';
import { addNode, resetFlow } from '../../store/flowSlice';
import { clearActiveFlow } from '../../store/flowsSlice';
import { generateNodeId, NODE_TEMPLATES } from '../../constants/nodeDefaults';
import FlowLibraryPanel from './FlowLibraryPanel';

const SIDEBAR_ITEMS = [
  { type: 'start', label: '開始', icon: <PlayArrowIcon color="success" /> },
  { type: 'state', label: '状態', icon: <CircleIcon color="primary" /> },
  { type: 'jackpot', label: '大当たり', icon: <EmojiEventsIcon color="warning" /> },
  { type: 'event', label: 'イベント', icon: <BoltIcon color="secondary" /> },
];

function FlowSidebar() {
  const dispatch = useDispatch();

  const handleAddNode = (type) => {
    const template = NODE_TEMPLATES[type];
    const resolved = typeof template === 'function' ? template() : template;
    const id = generateNodeId(type);
    dispatch(
      addNode({
        id,
        type: resolved.type,
        position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 300 },
        data: { ...resolved.data },
      }),
    );
  };

  const handleReset = () => {
    if (
      window.confirm(
        'キャンバスを初期状態に戻します。保存済みフローは削除されません。',
      )
    ) {
      dispatch(resetFlow());
      dispatch(clearActiveFlow());
    }
  };

  return (
    <Paper
      sx={{
        width: 260,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: 'divider',
        borderRadius: 0,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <FlowLibraryPanel />
      <Divider />
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          ノード追加
        </Typography>
        <Typography variant="caption" color="text.secondary">
          クリックでキャンバスに追加
        </Typography>
      </Box>
      <Divider />
      <List dense disablePadding>
        {SIDEBAR_ITEMS.map((item) => (
          <ListItem key={item.type} disablePadding>
            <ListItemButton onClick={() => handleAddNode(item.type)}>
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          size="small"
          startIcon={<DeleteSweepIcon />}
          onClick={handleReset}
        >
          フローをリセット
        </Button>
      </Box>
    </Paper>
  );
}

export default FlowSidebar;
