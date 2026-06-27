import {
  hasLimitedSpins,
  isRushFall,
  isRushState,
  isNormalState,
  consumesBalls,
  STATE_TYPE_LABELS,
} from '../constants/nodeDefaults';
import {
  ballsToYen,
  calcBallsPerRotation,
  calcNetYen,
  downsampleTrend,
  buildJackpotBreakdown,
  MAX_SPINS,
  MAX_TREND_POINTS,
  TREND_COMPACT_THRESHOLD,
  MAX_NORMAL_JACKPOT_BARS,
  MAX_CHART_BARS_DISPLAY,
} from './constants';
import {
  getTargetNode,
  pickDistribution,
  resolveStartTarget,
  rollProbability,
} from './flowGraph';

function createStats() {
  return {
    ballsUsed: 0,
    ballsWon: 0,
    investmentYen: 0,
    prizeYen: 0,
    investmentBuckets: 0,
    spinCount: 0,
    jackpotCount: 0,
    jackpotByStateType: {
      normal: 0,
      short: 0,
      rush: 0,
      rush_fall: 0,
    },
    normalSpins: 0,
    rushSpins: 0,
    normalJackpots: 0,
    rushJackpots: 0,
    trend: [],
    minNetYen: 0,
    errors: [],
    stoppedReason: null,
    normalSpinsPending: 0,
    normalJackpotBars: [],
    totalNormalJackpotBars: 0,
  };
}

function updateInvestment(stats) {
  const buckets = Math.floor(stats.ballsUsed / 125);
  if (buckets > stats.investmentBuckets) {
    stats.investmentYen += (buckets - stats.investmentBuckets) * 500;
    stats.investmentBuckets = buckets;
  }
  stats.prizeYen = ballsToYen(stats.ballsWon);
  trackMinNetYen(stats);
}

function trackMinNetYen(stats) {
  const netYen = calcNetYen(stats);
  if (netYen < stats.minNetYen) {
    stats.minNetYen = netYen;
  }
}

function buildTrendPoint(stats) {
  return {
    index: stats.spinCount,
    diff: Math.round((stats.ballsWon - stats.ballsUsed) * 10) / 10,
    netYen: Math.round(calcNetYen(stats)),
    investmentYen: Math.round(stats.investmentYen),
    prizeYen: Math.round(stats.prizeYen),
  };
}

function appendTrend(stats) {
  stats.trend.push(buildTrendPoint(stats));
  if (stats.trend.length >= TREND_COMPACT_THRESHOLD) {
    stats.trend = downsampleTrend(stats.trend, MAX_TREND_POINTS);
  }
}

function updateLatestTrend(stats) {
  if (stats.trend.length === 0) return;
  const last = stats.trend[stats.trend.length - 1];
  Object.assign(last, buildTrendPoint(stats));
}

function recordSpin(stats) {
  stats.spinCount += 1;
  updateInvestment(stats);
  appendTrend(stats);
}

function performRotation(stats, ballsPerRotation, useBalls) {
  if (useBalls) {
    stats.ballsUsed += ballsPerRotation;
  }
  recordSpin(stats);
}

function recordJackpot(stats, stateType) {
  stats.jackpotCount += 1;
  if (stats.jackpotByStateType[stateType] !== undefined) {
    stats.jackpotByStateType[stateType] += 1;
  }
  if (isRushState(stateType)) {
    stats.rushJackpots += 1;
  } else {
    stats.normalJackpots += 1;
  }
}

function recordStateSpin(stats, stateType) {
  if (isRushState(stateType)) {
    stats.rushSpins += 1;
  } else {
    stats.normalSpins += 1;
  }
}

export function createSnapshot(stats, currentStatus = null, options = {}) {
  const breakdown = buildJackpotBreakdown(stats.jackpotByStateType).map((item) => ({
    ...item,
    label: STATE_TYPE_LABELS[item.type] ?? item.type,
  }));
  const netYen = calcNetYen(stats);
  const maxLossYen = options.maxLossYen ?? null;

  return {
    ballsUsed: stats.ballsUsed,
    ballsWon: stats.ballsWon,
    investmentYen: stats.investmentYen,
    prizeYen: stats.prizeYen,
    netYen,
    minNetYen: stats.minNetYen,
    maxLossYen,
    investmentBuckets: stats.investmentBuckets,
    spinCount: stats.spinCount,
    jackpotCount: stats.jackpotCount,
    jackpotByStateType: { ...stats.jackpotByStateType },
    normalSpins: stats.normalSpins,
    rushSpins: stats.rushSpins,
    normalJackpots: stats.normalJackpots,
    rushJackpots: stats.rushJackpots,
    trend: downsampleTrend(stats.trend),
    errors: [...stats.errors],
    stoppedReason: stats.stoppedReason,
    jackpotBreakdown: breakdown,
    currentStatus: currentStatus ?? { phase: 'idle', label: '待機中' },
    normalJackpotBars: stats.normalJackpotBars
      .slice(-MAX_CHART_BARS_DISPLAY)
      .map((bar) => ({ ...bar })),
    totalNormalJackpotBars: stats.totalNormalJackpotBars,
  };
}

const NODE_TYPE_LABELS = {
  start: '開始',
  jackpot: '大当たり',
  event: 'イベント',
};

export class SimulationRunner {
  constructor({ nodes, edges, rotationsPer1000Yen = 18, maxLossYen = null }) {
    this.nodes = nodes;
    this.edges = edges;
    this.ballsPerRotation = calcBallsPerRotation(rotationsPer1000Yen);
    this.maxLossYen = maxLossYen != null && maxLossYen > 0 ? maxLossYen : null;
    this.stats = createStats();
    this.currentNode = null;
    this.visitNodeId = null;
    this.spinsDoneInVisit = 0;
    this.lastArrivedStateId = null;
    this.jackpotEpisode = null;
    this.stopped = false;
    this.initialize();
  }

  initialize() {
    const { node, error } = resolveStartTarget(this.nodes, this.edges);
    if (error) {
      this.stats.errors.push(error);
      this.stop('error');
      return;
    }
    this.currentNode = node;
    this.clearVisit();
    this.advanceThroughInstantNodes();
  }

  stop(reason = 'error') {
    this.stopped = true;
    this.stats.stoppedReason = reason;
  }

  clearVisit() {
    this.visitNodeId = null;
    this.spinsDoneInVisit = 0;
    this.lastArrivedStateId = null;
  }

  onArriveAtState(stateNode) {
    const { stateType } = stateNode.data;
    if (isNormalState(stateType)) {
      this.finalizeJackpotEpisode();
    }
    if (this.jackpotEpisode && isRushState(stateType)) {
      this.jackpotEpisode.enteredRush = true;
    }
  }

  finalizeJackpotEpisode() {
    if (!this.jackpotEpisode) return;
    const { normalSpins, spinAtJackpot, chain, enteredRush, ballsWonAtStart } =
      this.jackpotEpisode;
    const ballsWon = Math.max(0, Math.round(this.stats.ballsWon - ballsWonAtStart));
    this.stats.normalJackpotBars.push({
      index: this.stats.totalNormalJackpotBars + 1,
      normalSpins,
      spinAtJackpot,
      ballsWon,
      rushChain: enteredRush ? chain : null,
    });
    this.stats.totalNormalJackpotBars += 1;
    if (this.stats.normalJackpotBars.length > MAX_NORMAL_JACKPOT_BARS) {
      const overflow = this.stats.normalJackpotBars.length - MAX_NORMAL_JACKPOT_BARS;
      this.stats.normalJackpotBars.splice(0, overflow);
    }
    this.jackpotEpisode = null;
  }

  handleJackpotFromState(stateType) {
    if (isNormalState(stateType)) {
      this.jackpotEpisode = {
        normalSpins: this.stats.normalSpinsPending,
        spinAtJackpot: this.stats.spinCount,
        ballsWonAtStart: this.stats.ballsWon,
        chain: 1,
        enteredRush: false,
      };
      this.stats.normalSpinsPending = 0;
    } else if (this.jackpotEpisode) {
      this.jackpotEpisode.chain += 1;
      if (isRushState(stateType)) {
        this.jackpotEpisode.enteredRush = true;
      }
    }
    recordJackpot(this.stats, stateType);
  }

  beginVisit(stateNode) {
    if (this.visitNodeId !== stateNode.id) {
      this.visitNodeId = stateNode.id;
      this.spinsDoneInVisit = 0;
    }
  }

  getCurrentStatus() {
    if (this.stats.errors.length > 0 && this.stopped) {
      return {
        phase: 'error',
        label: this.stats.errors[this.stats.errors.length - 1],
      };
    }

    if (this.stopped) {
      return {
        phase: 'stopped',
        label: this.getStoppedLabel(),
        stoppedReason: this.stats.stoppedReason,
      };
    }

    if (!this.currentNode) {
      return { phase: 'idle', label: '待機中' };
    }

    const { type, data } = this.currentNode;

    if (type === 'state') {
      const limited = hasLimitedSpins(data);
      return {
        phase: 'state',
        nodeType: type,
        label: data.label,
        stateType: data.stateType,
        stateTypeLabel: STATE_TYPE_LABELS[data.stateType] ?? data.stateType,
        spinsDone: this.spinsDoneInVisit,
        spinsTotal: limited ? data.spins : null,
        freeSpin: !consumesBalls(data.stateType),
      };
    }

    return {
      phase: type,
      nodeType: type,
      label: data.label,
      nodeTypeLabel: NODE_TYPE_LABELS[type] ?? type,
    };
  }

  getStoppedLabel() {
    switch (this.stats.stoppedReason) {
      case 'loss_limit':
        return `収支が -${this.maxLossYen?.toLocaleString()} 円に達したため終了`;
      case 'max_spins':
        return '最大回転数に達したため終了';
      case 'completed':
        return 'シミュレーション完了';
      case 'error':
        return 'エラーにより停止';
      default:
        return 'シミュレーション停止';
    }
  }

  getSnapshot() {
    return createSnapshot(this.stats, this.getCurrentStatus(), {
      maxLossYen: this.maxLossYen,
    });
  }

  isStopped() {
    return this.stopped;
  }

  advanceThroughInstantNodes() {
    while (this.currentNode && !this.stopped) {
      if (this.currentNode.type === 'state') {
        if (this.lastArrivedStateId !== this.currentNode.id) {
          this.lastArrivedStateId = this.currentNode.id;
          this.onArriveAtState(this.currentNode);
        }
        return;
      }

      switch (this.currentNode.type) {
        case 'jackpot':
          if (!this.processJackpotNode(this.currentNode)) return;
          break;
        case 'event':
        case 'start': {
          const next = getTargetNode(this.nodes, this.edges, this.currentNode.id, null);
          if (!next) {
            this.stats.errors.push(`「${this.currentNode.data.label}」の遷移先が未接続です`);
            this.stop('error');
            return;
          }
          this.currentNode = next;
          this.clearVisit();
          break;
        }
        case 'end':
          this.stop('completed');
          return;
        default:
          this.stats.errors.push(`未対応のノードタイプ: ${this.currentNode.type}`);
          this.stop('error');
          return;
      }
    }
  }

  processJackpotNode(jackpotNode) {
    const { data } = jackpotNode;
    const distributions = data.distributions || [];
    const picked = pickDistribution(distributions);

    if (!picked) {
      this.stats.errors.push(`「${data.label}」の振り分けが設定されていません`);
      this.stop('error');
      return false;
    }

    this.stats.ballsWon += Number(picked.balls) || 0;
    updateInvestment(this.stats);
    updateLatestTrend(this.stats);

    const nextNode = getTargetNode(this.nodes, this.edges, jackpotNode.id, picked.id);
    if (!nextNode) {
      this.stats.errors.push(
        `「${data.label}」の振り分け「${picked.label}」の遷移先が未接続です`,
      );
      this.stop('error');
      return false;
    }

    this.currentNode = nextNode;
    this.clearVisit();
    return true;
  }

  stepState(stateNode) {
    if (this.stats.spinCount >= MAX_SPINS) {
      this.stop('max_spins');
      return;
    }

    const { data } = stateNode;
    const limited = hasLimitedSpins(data);
    const rushFall = isRushFall(data.stateType);

    this.beginVisit(stateNode);
    performRotation(this.stats, this.ballsPerRotation, consumesBalls(data.stateType));
    recordStateSpin(this.stats, data.stateType);
    this.spinsDoneInVisit += 1;

    if (isNormalState(data.stateType)) {
      this.stats.normalSpinsPending += 1;
    }

    if (rollProbability(data.jackpotProbability)) {
      this.handleJackpotFromState(data.stateType);
      const jackpotNode = getTargetNode(this.nodes, this.edges, stateNode.id, 'jackpot');
      if (!jackpotNode) {
        this.stats.errors.push(`「${data.label}」の大当たり遷移先が未接続です`);
        this.stop('error');
        return;
      }
      this.currentNode = jackpotNode;
      this.clearVisit();
      this.advanceThroughInstantNodes();
      return;
    }

    const chargeProb = data.chargeProbability ?? 0;
    if (data.stateType === 'normal' && chargeProb > 0 && rollProbability(chargeProb)) {
      const chargeNode = getTargetNode(this.nodes, this.edges, stateNode.id, 'charge');
      if (!chargeNode) {
        this.stats.errors.push(`「${data.label}」のチャージ遷移先が未接続です`);
        this.stop('error');
        return;
      }
      this.currentNode = chargeNode;
      this.clearVisit();
      this.advanceThroughInstantNodes();
      return;
    }

    if (rushFall && rollProbability(data.fallProbability)) {
      const fallNode = getTargetNode(this.nodes, this.edges, stateNode.id, 'fall');
      if (!fallNode) {
        this.stats.errors.push(`「${data.label}」の転落遷移先が未接続です`);
        this.stop('error');
        return;
      }
      this.currentNode = fallNode;
      this.clearVisit();
      this.advanceThroughInstantNodes();
      return;
    }

    if (limited && this.spinsDoneInVisit >= data.spins) {
      const noWinNode = getTargetNode(this.nodes, this.edges, stateNode.id, 'noWin');
      if (!noWinNode) {
        this.stats.errors.push(`「${data.label}」の非当選遷移先が未接続です`);
        this.stop('error');
        return;
      }
      this.currentNode = noWinNode;
      this.clearVisit();
      this.advanceThroughInstantNodes();
    }
  }

  step() {
    if (this.stopped) return;

    if (!this.currentNode) {
      this.stop('completed');
      return;
    }

    this.advanceThroughInstantNodes();
    if (this.stopped || !this.currentNode) return;

    if (this.currentNode.type === 'state') {
      this.stepState(this.currentNode);
    }

    this.checkLossLimit();
  }

  checkLossLimit() {
    if (!this.maxLossYen || this.stopped) return;
    if (calcNetYen(this.stats) <= -this.maxLossYen) {
      this.stop('loss_limit');
    }
  }

  advance(stepCount) {
    for (let i = 0; i < stepCount && !this.stopped; i += 1) {
      this.step();
    }
  }
}
