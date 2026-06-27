import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  useTheme,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ScienceIcon from '@mui/icons-material/Science';
import { SimulationRunner, createSnapshot } from '../simulation/runner';
import CurrentStateIndicator from '../components/simulator/CurrentStateIndicator';
import NormalJackpotBarChart from '../components/simulator/NormalJackpotBarChart';
import SimulatorTrendChart from '../components/simulator/SimulatorTrendChart';
import SimulatorStatsPanel from '../components/simulator/SimulatorStatsPanel';
import {
  DEFAULT_ROTATIONS_PER_1000YEN,
  DEFAULT_ROTATIONS_PER_SECOND,
  MAX_STEPS_PER_FRAME,
  SNAPSHOT_INTERVAL_MS,
  STOPPED_REASON_LABELS,
  calcBallsPerRotation,
} from '../simulation/constants';
import {
  selectSavedFlows,
  selectSimulatorFlow,
  selectSimulatorFlowId,
  setSimulatorFlowId,
} from '../store/flowsSlice';
import NumericTextField from '../components/common/NumericTextField';
import useIsMobile from '../hooks/useIsMobile';

const EMPTY_SNAPSHOT = createSnapshot({
  ballsUsed: 0,
  ballsWon: 0,
  investmentYen: 0,
  prizeYen: 0,
  minNetYen: 0,
  investmentBuckets: 0,
  spinCount: 0,
  jackpotCount: 0,
  jackpotByStateType: { normal: 0, short: 0, rush: 0, rush_fall: 0 },
  normalSpins: 0,
  rushSpins: 0,
  normalJackpots: 0,
  rushJackpots: 0,
  trend: [],
  errors: [],
  stoppedReason: null,
  normalJackpotBars: [],
  totalNormalJackpotBars: 0,
});

function SimulatorPage() {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const dispatch = useDispatch();
  const savedFlows = useSelector(selectSavedFlows);
  const simulatorFlowId = useSelector(selectSimulatorFlowId);
  const simulatorFlow = useSelector(selectSimulatorFlow);
  const nodes = simulatorFlow?.nodes ?? [];
  const edges = simulatorFlow?.edges ?? [];

  const [rotationsPer1000Yen, setRotationsPer1000Yen] = useState(DEFAULT_ROTATIONS_PER_1000YEN);
  const [rotationsPerSecond, setRotationsPerSecond] = useState(DEFAULT_ROTATIONS_PER_SECOND);
  const [maxLossYenInput, setMaxLossYenInput] = useState('');
  const [running, setRunning] = useState(false);
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT);

  const runnerRef = useRef(null);
  const rafRef = useRef(null);
  const spinDebtRef = useRef(0);
  const lastTimeRef = useRef(null);
  const lastSnapshotTimeRef = useRef(0);

  const parsedMaxLossYen = useMemo(() => {
    if (maxLossYenInput === '') return null;
    const n = Number(maxLossYenInput);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [maxLossYenInput]);

  const ballsPerRotation = calcBallsPerRotation(rotationsPer1000Yen);

  const initRunner = useCallback(() => {
    runnerRef.current = new SimulationRunner({
      nodes,
      edges,
      rotationsPer1000Yen,
      maxLossYen: parsedMaxLossYen,
    });
    setSnapshot(runnerRef.current.getSnapshot());
    if (runnerRef.current.isStopped()) {
      setRunning(false);
    }
  }, [nodes, edges, rotationsPer1000Yen, parsedMaxLossYen]);

  const handleReset = () => {
    setRunning(false);
    spinDebtRef.current = 0;
    lastTimeRef.current = null;
    lastSnapshotTimeRef.current = 0;
    initRunner();
  };

  const handleStart = () => {
    if (!runnerRef.current || runnerRef.current.isStopped()) {
      initRunner();
    }
    if (runnerRef.current?.isStopped()) return;
    spinDebtRef.current = 0;
    lastTimeRef.current = null;
    lastSnapshotTimeRef.current = 0;
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
  };

  useEffect(() => {
    if (savedFlows.length > 0 && !simulatorFlowId) {
      dispatch(setSimulatorFlowId(savedFlows[0].id));
    }
  }, [savedFlows, simulatorFlowId, dispatch]);

  useEffect(() => {
    setRunning(false);
  }, [simulatorFlowId]);

  useEffect(() => {
    initRunner();
  }, [initRunner]);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return undefined;
    }

    const tick = (timestamp) => {
      const runner = runnerRef.current;
      if (!runner || runner.isStopped()) {
        setRunning(false);
        setSnapshot(runner?.getSnapshot() ?? EMPTY_SNAPSHOT);
        return;
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      const deltaSec = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      spinDebtRef.current += deltaSec * rotationsPerSecond;
      const steps = Math.min(Math.floor(spinDebtRef.current), MAX_STEPS_PER_FRAME);
      spinDebtRef.current -= steps;

      if (steps > 0) {
        runner.advance(steps);
        const shouldUpdateSnapshot =
          runner.isStopped() ||
          timestamp - lastSnapshotTimeRef.current >= SNAPSHOT_INTERVAL_MS;
        if (shouldUpdateSnapshot) {
          setSnapshot(runner.getSnapshot());
          lastSnapshotTimeRef.current = timestamp;
        }
        if (runner.isStopped()) {
          setSnapshot(runner.getSnapshot());
          setRunning(false);
          return;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, rotationsPerSecond]);

  const stoppedLabel = STOPPED_REASON_LABELS[snapshot.stoppedReason];

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        height: '100%',
        overflow: 'auto',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ mb: { xs: 2, sm: 3 } }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: { xs: 40, sm: 44 },
            height: { xs: 40, sm: 44 },
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
          }}
        >
          <ScienceIcon />
        </Box>
        <Box>
          <Typography variant={isMobile ? 'h6' : 'h5'}>シミュレーション</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            フローを実行して統計を確認
          </Typography>
        </Box>
      </Stack>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, bgcolor: alpha(theme.palette.background.paper, 0.9) }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          シミュレーション設定
        </Typography>
        {savedFlows.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            フローエディタでフローに名前を付けて保存してください。
          </Alert>
        ) : (
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>シミュレーションするフロー</InputLabel>
            <Select
              label="シミュレーションするフロー"
              value={simulatorFlowId ?? ''}
              onChange={(e) => dispatch(setSimulatorFlowId(e.target.value))}
              disabled={running}
            >
              {savedFlows.map((flow) => (
                <MenuItem key={flow.id} value={flow.id}>
                  {flow.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <Grid container spacing={2} alignItems="flex-end">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <NumericTextField
              label="1000円（250玉）あたりの回転数"
              fullWidth
              size="small"
              allowDecimal
              value={rotationsPer1000Yen}
              onCommit={setRotationsPer1000Yen}
              min={0.1}
              defaultOnEmpty={DEFAULT_ROTATIONS_PER_1000YEN}
              disabled={running}
              helperText={`1回転 ≈ ${ballsPerRotation.toFixed(2)} 玉消費`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <NumericTextField
              label="1秒あたりの回転数"
              fullWidth
              size="small"
              allowDecimal
              value={rotationsPerSecond}
              onCommit={setRotationsPerSecond}
              min={0.1}
              defaultOnEmpty={DEFAULT_ROTATIONS_PER_SECOND}
              disabled={running}
              helperText="シミュレーション速度（回転/秒）"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <NumericTextField
              label="上限金額（円）"
              fullWidth
              size="small"
              allowEmpty
              value={parsedMaxLossYen}
              onCommit={(value) => setMaxLossYenInput(value == null ? '' : String(value))}
              min={1}
              disabled={running}
              placeholder="上限なし"
              helperText={
                parsedMaxLossYen
                  ? `収支が -${parsedMaxLossYen.toLocaleString()} 円で自動終了`
                  : '空欄の場合は上限なし'
              }
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                variant="contained"
                fullWidth
                size={isMobile ? 'medium' : 'large'}
                startIcon={<PlayArrowIcon />}
                onClick={handleStart}
                disabled={running || !simulatorFlow}
              >
                開始
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size={isMobile ? 'medium' : 'large'}
                startIcon={<StopIcon />}
                onClick={handleStop}
                disabled={!running}
              >
                停止
              </Button>
              <Button
                variant="outlined"
                fullWidth={isMobile}
                size={isMobile ? 'medium' : 'large'}
                onClick={handleReset}
                disabled={running}
                sx={{ minWidth: { sm: 56 }, px: 1 }}
                aria-label="リセット"
              >
                <RestartAltIcon sx={{ mr: { xs: 1, sm: 0 } }} />
                {isMobile ? 'リセット' : null}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {snapshot.errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {snapshot.errors.map((err) => (
            <div key={err}>{err}</div>
          ))}
        </Alert>
      )}

      {!running && snapshot.stoppedReason === 'loss_limit' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {snapshot.currentStatus?.label ?? '上限金額に達したためシミュレーションを終了しました。'}
        </Alert>
      )}

      {!running && snapshot.stoppedReason && snapshot.stoppedReason !== 'loss_limit' && stoppedLabel && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {snapshot.currentStatus?.label ?? stoppedLabel}
        </Alert>
      )}

      <Stack spacing={{ xs: 2, sm: 3 }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, bgcolor: alpha(theme.palette.background.paper, 0.9) }}>
          <SimulatorTrendChart
            trend={snapshot.trend}
            spinCount={snapshot.spinCount}
            maxLossYen={snapshot.maxLossYen}
          />
        </Paper>

        <CurrentStateIndicator status={snapshot.currentStatus} running={running} />

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
          }}
        >
          <NormalJackpotBarChart
            bars={snapshot.normalJackpotBars ?? []}
            totalNormalJackpots={snapshot.totalNormalJackpotBars ?? snapshot.normalJackpots}
          />
        </Paper>

        <SimulatorStatsPanel snapshot={snapshot} />
      </Stack>
    </Box>
  );
}

export default SimulatorPage;
