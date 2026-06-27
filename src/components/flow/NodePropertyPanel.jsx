import { useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  updateNodeData,
  setJackpotDistributions,
  setSourceHandleTarget,
} from '../../store/flowSlice';
import {
  STATE_TYPE_OPTIONS,
  generateDistributionId,
  isRushFall,
  hasLimitedSpins,
  isNormalState,
  hasChargeProbability,
  formatCombinedJackpotProb,
} from '../../constants/nodeDefaults';
import PayoutPieChart from './PayoutPieChart';

function StatePropertyForm({ node, nodes, edges }) {
  const dispatch = useDispatch();
  const { data } = node;
  const rushFall = isRushFall(data.stateType);
  const limitedSpins = hasLimitedSpins(data);

  const noWinEdge = edges.find(
    (e) => e.source === node.id && e.sourceHandle === 'noWin',
  );
  const noWinTarget = noWinEdge?.target ?? '';

  const jackpotEdge = edges.find(
    (e) => e.source === node.id && (e.sourceHandle === 'jackpot' || !e.sourceHandle),
  );
  const jackpotTarget = jackpotEdge?.target ?? '';

  const fallEdge = edges.find(
    (e) => e.source === node.id && e.sourceHandle === 'fall',
  );
  const fallTarget = fallEdge?.target ?? '';

  const chargeEdge = edges.find(
    (e) => e.source === node.id && e.sourceHandle === 'charge',
  );
  const chargeTarget = chargeEdge?.target ?? '';

  const targetNodeOptions = nodes.filter((n) => n.id !== node.id);
  const isNormal = isNormalState(data.stateType);
  const hasCharge = hasChargeProbability(data);
  const combinedProb = isNormal
    ? formatCombinedJackpotProb(data.jackpotProbability, data.chargeProbability)
    : null;

  const renderTargetSelect = (label, sourceHandle, value) => (
    <FormControl size="small" fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(e) => handleTransitionChange(sourceHandle, e.target.value)}
      >
        <MenuItem value="">
          <em>未設定</em>
        </MenuItem>
        {targetNodeOptions.map((n) => (
          <MenuItem key={n.id} value={n.id}>
            {n.data.label} ({n.type})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const handleChange = (field, value) => {
    const updates = { [field]: value };
    if (field === 'stateType' && isRushFall(value)) {
      updates.spins = 0;
    }
    if (field === 'stateType' && value !== 'normal') {
      updates.chargeProbability = 0;
    }
    dispatch(updateNodeData({ id: node.id, data: updates }));
  };

  const handleTransitionChange = (sourceHandle, targetNodeId) => {
    dispatch(
      setSourceHandleTarget({
        sourceNodeId: node.id,
        sourceHandle,
        targetNodeId: targetNodeId || null,
      }),
    );
  };

  return (
    <Stack spacing={2}>
      <TextField
        label="ラベル"
        size="small"
        fullWidth
        value={data.label}
        onChange={(e) => handleChange('label', e.target.value)}
      />
      <FormControl size="small" fullWidth>
        <InputLabel>状態タイプ</InputLabel>
        <Select
          label="状態タイプ"
          value={data.stateType}
          onChange={(e) => handleChange('stateType', e.target.value)}
        >
          {STATE_TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {rushFall ? (
        <>
          <TextField
            label="大当たり確率（分母 N）"
            size="small"
            fullWidth
            type="number"
            inputProps={{ min: 1 }}
            value={data.jackpotProbability ?? ''}
            onChange={(e) =>
              handleChange('jackpotProbability', Number(e.target.value) || 0)
            }
            helperText="1/N の N を入力"
          />
          <TextField
            label="転落確率（分母 N）"
            size="small"
            fullWidth
            type="number"
            inputProps={{ min: 1 }}
            value={data.fallProbability ?? ''}
            onChange={(e) => handleChange('fallProbability', Number(e.target.value) || 0)}
            helperText="1/N の N を入力"
          />
        </>
      ) : (
        <>
          <TextField
            label="大当たり確率（分母 N）"
            size="small"
            fullWidth
            type="number"
            inputProps={{ min: 1 }}
            value={data.jackpotProbability ?? ''}
            onChange={(e) =>
              handleChange('jackpotProbability', Number(e.target.value) || 0)
            }
            helperText="1/N の N を入力（例: 319 → 1/319）"
          />
          {isNormal && (
            <TextField
              label="チャージ確率（分母 N）"
              size="small"
              fullWidth
              type="number"
              inputProps={{ min: 0 }}
              value={data.chargeProbability ?? 0}
              onChange={(e) =>
                handleChange('chargeProbability', Number(e.target.value) || 0)
              }
              helperText={
                combinedProb
                  ? `0 = チャージなし / 合算大当たり確率: ${combinedProb}`
                  : '0 = チャージなし'
              }
            />
          )}
          <TextField
            label="回転数"
            size="small"
            fullWidth
            type="number"
            inputProps={{ min: 0 }}
            value={data.spins ?? 0}
            onChange={(e) => handleChange('spins', Number(e.target.value) || 0)}
            helperText="0 の場合は無制限"
          />
        </>
      )}

      {limitedSpins && (
        <>
          <Divider />
          <Typography variant="caption" fontWeight="bold" color="text.secondary">
            遷移先
          </Typography>
          {renderTargetSelect('大当たり時', 'jackpot', jackpotTarget)}
          {hasCharge && renderTargetSelect('チャージ時', 'charge', chargeTarget)}
          {renderTargetSelect('非当選時（回転終了）', 'noWin', noWinTarget)}
          <Typography variant="caption" color="text.secondary">
            ノード下部のハンドルからも接続できます
          </Typography>
        </>
      )}

      {rushFall && (
        <>
          <Divider />
          <Typography variant="caption" fontWeight="bold" color="text.secondary">
            遷移先
          </Typography>
          {renderTargetSelect('大当たり時', 'jackpot', jackpotTarget)}
          {renderTargetSelect('転落時', 'fall', fallTarget)}
          <Typography variant="caption" color="text.secondary">
            ノード下部のハンドルからも接続できます
          </Typography>
        </>
      )}

      {!limitedSpins && !rushFall && (
        <>
          <Divider />
          <Typography variant="caption" fontWeight="bold" color="text.secondary">
            遷移先
          </Typography>
          {renderTargetSelect('大当たり時', 'jackpot', jackpotTarget)}
          {hasCharge && renderTargetSelect('チャージ時', 'charge', chargeTarget)}
        </>
      )}
    </Stack>
  );
}

function JackpotPropertyForm({ node }) {
  const dispatch = useDispatch();
  const { data } = node;
  const distributions = data.distributions || [];

  const updateDistributions = (next) => {
    dispatch(setJackpotDistributions({ nodeId: node.id, distributions: next }));
  };

  const handleLabelChange = (value) => {
    dispatch(updateNodeData({ id: node.id, data: { label: value } }));
  };

  const handleDistributionChange = (index, field, value) => {
    const next = distributions.map((d, i) =>
      i === index ? { ...d, [field]: value } : d,
    );
    updateDistributions(next);
  };

  const handleAddDistribution = () => {
    updateDistributions([
      ...distributions,
      { id: generateDistributionId(), label: '新規', balls: 0, weight: 1 },
    ]);
  };

  const handleRemoveDistribution = (index) => {
    updateDistributions(distributions.filter((_, i) => i !== index));
  };

  return (
    <Stack spacing={2}>
      <TextField
        label="ラベル"
        size="small"
        fullWidth
        value={data.label}
        onChange={(e) => handleLabelChange(e.target.value)}
      />

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <PayoutPieChart distributions={distributions} size={120} />
      </Box>

      <Typography variant="caption" color="text.secondary">
        各振り分けの右側ハンドルから遷移先ノードへ接続できます
      </Typography>

      {distributions.map((dist, index) => (
        <Paper key={dist.id} variant="outlined" sx={{ p: 1.5 }}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="caption" fontWeight="bold">
                振り分け {index + 1}
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveDistribution(index)}
                disabled={distributions.length <= 1}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
            <TextField
              label="名称"
              size="small"
              fullWidth
              value={dist.label}
              onChange={(e) => handleDistributionChange(index, 'label', e.target.value)}
            />
            <Stack direction="row" spacing={1}>
              <TextField
                label="出玉"
                size="small"
                type="number"
                inputProps={{ min: 0 }}
                value={dist.balls}
                onChange={(e) =>
                  handleDistributionChange(index, 'balls', Number(e.target.value) || 0)
                }
                sx={{ flex: 1 }}
              />
              <TextField
                label="比重"
                size="small"
                type="number"
                inputProps={{ min: 1 }}
                value={dist.weight}
                onChange={(e) =>
                  handleDistributionChange(index, 'weight', Number(e.target.value) || 1)
                }
                sx={{ flex: 1 }}
              />
            </Stack>
          </Stack>
        </Paper>
      ))}

      <Button
        variant="outlined"
        size="small"
        startIcon={<AddIcon />}
        onClick={handleAddDistribution}
      >
        振り分けを追加
      </Button>
    </Stack>
  );
}

const PANEL_CONTENT = {
  state: StatePropertyForm,
  jackpot: JackpotPropertyForm,
};

function NodePropertyPanel({ selectedNode, nodes, edges }) {
  if (!selectedNode) {
    return (
      <Paper
        sx={{
          width: 300,
          flexShrink: 0,
          borderLeft: 1,
          borderColor: 'divider',
          borderRadius: 0,
          bgcolor: 'background.paper',
          p: 2,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          ノードを選択すると
          <br />
          プロパティを編集できます
        </Typography>
      </Paper>
    );
  }

  const FormComponent = PANEL_CONTENT[selectedNode.type];

  return (
    <Paper
      sx={{
        width: 300,
        flexShrink: 0,
        borderLeft: 1,
        borderColor: 'divider',
        borderRadius: 0,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          プロパティ
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {selectedNode.type} / {selectedNode.id}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 2, overflow: 'auto', flexGrow: 1 }}>
        {FormComponent ? (
          <FormComponent node={selectedNode} nodes={nodes} edges={edges} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            このノードタイプは編集不可です
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

export default NodePropertyPanel;
