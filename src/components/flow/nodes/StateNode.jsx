import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Paper, Typography, Chip, Box } from '@mui/material';
import {
  STATE_TYPE_OPTIONS,
  isRushFall,
  hasLimitedSpins,
  hasChargeProbability,
  formatCombinedJackpotProb,
  formatProbabilityDenominator,
  formatLimitedSpinWinProbability,
  isNormalState,
} from '../../../constants/nodeDefaults';
import NodeShell from '../NodeShell';

function DualHandleFooter({ leftLabel, rightLabel, leftId, rightId, leftColor, rightColor }) {
  return (
    <Box sx={{ position: 'relative', height: 20, mx: -0.5 }}>
      <Typography
        variant="caption"
        color={leftColor}
        sx={{ position: 'absolute', left: '18%', transform: 'translateX(-50%)', bottom: 0 }}
      >
        {leftLabel}
      </Typography>
      <Typography
        variant="caption"
        color={rightColor}
        sx={{ position: 'absolute', left: '82%', transform: 'translateX(-50%)', bottom: 0 }}
      >
        {rightLabel}
      </Typography>
      <Handle type="source" position={Position.Bottom} id={leftId} style={{ left: '25%' }} />
      <Handle type="source" position={Position.Bottom} id={rightId} style={{ left: '75%' }} />
    </Box>
  );
}

function TripleHandleFooter({
  leftLabel,
  centerLabel,
  rightLabel,
  leftId,
  centerId,
  rightId,
  leftColor,
  centerColor,
  rightColor,
}) {
  return (
    <Box sx={{ position: 'relative', height: 20, mx: -0.5 }}>
      {[ 
        { label: leftLabel, id: leftId, left: '15%', color: leftColor },
        { label: centerLabel, id: centerId, left: '50%', color: centerColor },
        { label: rightLabel, id: rightId, left: '85%', color: rightColor },
      ].map((h) => (
        <Typography
          key={h.id}
          variant="caption"
          color={h.color}
          sx={{ position: 'absolute', left: h.left, transform: 'translateX(-50%)', bottom: 0 }}
        >
          {h.label}
        </Typography>
      ))}
      <Handle type="source" position={Position.Bottom} id={leftId} style={{ left: '15%' }} />
      <Handle type="source" position={Position.Bottom} id={centerId} style={{ left: '50%' }} />
      <Handle type="source" position={Position.Bottom} id={rightId} style={{ left: '85%' }} />
    </Box>
  );
}

function StateNode({ id, data }) {
  const stateLabel =
    STATE_TYPE_OPTIONS.find((o) => o.value === data.stateType)?.label ?? data.stateType;
  const limitedSpins = hasLimitedSpins(data);
  const rushFall = isRushFall(data.stateType);
  const hasCharge = hasChargeProbability(data);
  const combinedProb = isNormalState(data.stateType)
    ? formatCombinedJackpotProb(data.jackpotProbability, data.chargeProbability)
    : null;
  const expectedWinProb = limitedSpins ? formatLimitedSpinWinProbability(data) : null;
  const showHandles = limitedSpins || rushFall || hasCharge;

  return (
    <NodeShell nodeId={id} nodeType="state">
      <Paper
      sx={{
        px: 2,
        py: 1.5,
        minWidth: 160,
        bgcolor: 'background.paper',
        boxShadow: 3,
        border: 1,
        borderColor: 'primary.main',
        borderRadius: 2,
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Typography variant="body2" fontWeight="bold" gutterBottom sx={{ pr: 3.5 }}>
        {data.label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: showHandles ? 0.5 : 0 }}>
        <Chip label={stateLabel} size="small" color="primary" variant="outlined" />
        {data.jackpotProbability > 0 && (
          <Chip
            label={`大当たり ${formatProbabilityDenominator(data.jackpotProbability) ?? ''}`}
            size="small"
            color="warning"
            variant="outlined"
          />
        )}
        {hasCharge && (
          <Chip
            label={`チャージ ${formatProbabilityDenominator(data.chargeProbability) ?? ''}`}
            size="small"
            color="secondary"
            variant="outlined"
          />
        )}
        {combinedProb && (
          <Chip
            label={`合算 ${combinedProb}`}
            size="small"
            color="warning"
            variant="filled"
          />
        )}
        {rushFall && data.fallProbability > 0 && (
          <Chip
            label={`転落 ${formatProbabilityDenominator(data.fallProbability) ?? ''}`}
            size="small"
            color="error"
            variant="outlined"
          />
        )}
        {!rushFall && data.spins > 0 && (
          <Chip label={`${data.spins}回転`} size="small" variant="outlined" />
        )}
        {expectedWinProb != null && (
          <Chip
            label={`期待度 ${expectedWinProb}`}
            size="small"
            color="info"
            variant="filled"
          />
        )}
      </Box>

      {limitedSpins && hasCharge && (
        <TripleHandleFooter
          leftLabel="大当たり"
          centerLabel="チャージ"
          rightLabel="非当選"
          leftId="jackpot"
          centerId="charge"
          rightId="noWin"
          leftColor="warning.main"
          centerColor="secondary.main"
          rightColor="text.secondary"
        />
      )}
      {limitedSpins && !hasCharge && (
        <DualHandleFooter
          leftLabel="大当たり"
          rightLabel="非当選"
          leftId="jackpot"
          rightId="noWin"
          leftColor="warning.main"
          rightColor="text.secondary"
        />
      )}
      {rushFall && (
        <DualHandleFooter
          leftLabel="大当たり"
          rightLabel="転落"
          leftId="jackpot"
          rightId="fall"
          leftColor="warning.main"
          rightColor="error.main"
        />
      )}
      {!limitedSpins && hasCharge && (
        <DualHandleFooter
          leftLabel="大当たり"
          rightLabel="チャージ"
          leftId="jackpot"
          rightId="charge"
          leftColor="warning.main"
          rightColor="secondary.main"
        />
      )}
      {!limitedSpins && !rushFall && !hasCharge && (
        <Handle type="source" position={Position.Bottom} id="jackpot" />
      )}
      </Paper>
    </NodeShell>
  );
}

export default memo(StateNode);
