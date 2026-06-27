import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { loadFlowData, resetFlow } from '../../store/flowSlice';
import {
  saveFlow,
  loadFlow,
  deleteFlow,
  setSimulatorFlowId,
  clearActiveFlow,
  selectSavedFlows,
  selectActiveFlow,
} from '../../store/flowsSlice';

function FlowLibraryPanel() {
  const dispatch = useDispatch();
  const savedFlows = useSelector(selectSavedFlows);
  const activeFlow = useSelector(selectActiveFlow);
  const { nodes, edges, viewport } = useSelector((state) => state.flow);

  const [flowName, setFlowName] = useState(activeFlow?.name ?? '');

  useEffect(() => {
    if (activeFlow) {
      setFlowName(activeFlow.name);
    }
  }, [activeFlow?.id, activeFlow?.name]);

  const handleSave = () => {
    const name = flowName.trim();
    if (!name) return;

    dispatch(
      saveFlow({
        id: activeFlow?.id,
        name,
        nodes,
        edges,
        viewport,
      }),
    );
  };

  const handleLoad = (flow) => {
    dispatch(loadFlow(flow.id));
    dispatch(
      loadFlowData({
        nodes: flow.nodes,
        edges: flow.edges,
        viewport: flow.viewport,
      }),
    );
    setFlowName(flow.name);
    dispatch(setSimulatorFlowId(flow.id));
  };

  const handleDelete = (flowId, flowName) => {
    if (!window.confirm(`「${flowName}」を削除しますか？`)) return;
    dispatch(deleteFlow(flowId));
    if (activeFlow?.id === flowId) {
      setFlowName('');
    }
  };

  const handleNewFlow = () => {
    if (
      !window.confirm(
        '新規フローを作成します。未保存の変更は失われます。よろしいですか？',
      )
    ) {
      return;
    }
    dispatch(resetFlow());
    dispatch(clearActiveFlow());
    setFlowName('');
  };

  return (
    <Box>
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          フロー保存
        </Typography>
        {activeFlow ? (
          <Typography variant="caption" color="text.secondary">
            編集中: {activeFlow.name}
          </Typography>
        ) : (
          <Typography variant="caption" color="warning.main">
            未保存のフロー
          </Typography>
        )}
      </Box>
      <Box sx={{ px: 2, pb: 2 }}>
        <TextField
          label="フロー名"
          size="small"
          fullWidth
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          placeholder="例: 海物語 設定1"
          sx={{ mb: 1 }}
        />
        <Button
          fullWidth
          variant="contained"
          size="small"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!flowName.trim()}
        >
          {activeFlow ? '上書き保存' : '名前を付けて保存'}
        </Button>
        <Button fullWidth size="small" onClick={handleNewFlow} sx={{ mt: 0.5 }}>
          新規フロー
        </Button>
      </Box>

      {savedFlows.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 2, pb: 1 }}>
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
              保存済みフロー
            </Typography>
          </Box>
          <List dense disablePadding sx={{ maxHeight: 200, overflow: 'auto' }}>
            {savedFlows.map((flow) => (
              <ListItem
                key={flow.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleDelete(flow.id, flow.name)}
                    aria-label="削除"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={activeFlow?.id === flow.id}
                  onClick={() => handleLoad(flow)}
                >
                  <FolderOpenIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
                  <ListItemText
                    primary={flow.name}
                    secondary={`ノード ${flow.nodes.length} / 接続 ${flow.edges.length}`}
                    primaryTypographyProps={{ noWrap: true, variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );
}

export default FlowLibraryPanel;
