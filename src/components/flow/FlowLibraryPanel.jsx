import { useRef, useState, useEffect } from 'react';
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
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
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
import { buildFlowExportPayload, downloadFlowFile, parseFlowFile } from '../../utils/flowFile';

function FlowLibraryPanel() {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
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

  const handleDelete = (flowId, name) => {
    if (!window.confirm(`「${name}」を削除しますか？`)) return;
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

  const handleExport = () => {
    const payload = buildFlowExportPayload({
      name: flowName.trim() || activeFlow?.name || 'エクスポート',
      nodes,
      edges,
      viewport,
    });
    downloadFlowFile(payload);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const imported = parseFlowFile(text);

      const shouldConfirm =
        nodes.length > 1 ||
        edges.length > 0 ||
        Boolean(activeFlow) ||
        flowName.trim().length > 0;

      if (shouldConfirm && !window.confirm('現在のフローを置き換えて読み込みます。よろしいですか？')) {
        return;
      }

      dispatch(clearActiveFlow());
      dispatch(
        loadFlowData({
          nodes: imported.nodes,
          edges: imported.edges,
          viewport: imported.viewport,
        }),
      );
      setFlowName(imported.name);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '読み込みに失敗しました');
    }
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={handleImportFile}
      />

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

        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
          >
            出力
          </Button>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            startIcon={<FileUploadIcon />}
            onClick={handleImportClick}
          >
            読み込み
          </Button>
        </Stack>
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
