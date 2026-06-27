let nodeIdCounter = 0;
let distributionIdCounter = 0;

export function generateNodeId(type) {
  nodeIdCounter += 1;
  return `${type}-${Date.now()}-${nodeIdCounter}`;
}

export function generateDistributionId() {
  distributionIdCounter += 1;
  return `dist-${Date.now()}-${distributionIdCounter}`;
}

export const DEFAULT_JACKPOT_DISTRIBUTIONS = [
  { id: 'dist-default-1', label: '10R', balls: 1500, weight: 1 },
  { id: 'dist-default-2', label: '20R', balls: 3000, weight: 1 },
];

export const NODE_TEMPLATES = {
  start: {
    type: 'start',
    data: { label: '開始' },
  },
  state: {
    type: 'state',
    data: {
      label: '状態',
      stateType: 'normal',
      spins: 0,
      jackpotProbability: 319,
      chargeProbability: 0,
      fallProbability: 0,
    },
  },
  jackpot: () => ({
    type: 'jackpot',
    data: {
      label: '大当たり',
      distributions: DEFAULT_JACKPOT_DISTRIBUTIONS.map((d) => ({
        label: d.label,
        balls: d.balls,
        weight: d.weight,
        id: generateDistributionId(),
      })),
    },
  }),
  event: {
    type: 'event',
    data: {
      label: 'イベント',
      eventType: 'reach',
      probability: 1,
    },
  },
};

export const STATE_TYPE_OPTIONS = [
  { value: 'normal', label: '通常' },
  { value: 'short', label: '時短' },
  { value: 'rush', label: 'RUSH' },
  { value: 'rush_fall', label: 'RUSH（転落式）' },
];

export function isNormalState(stateType) {
  return stateType === 'normal';
}

/** 通常時かつチャージ確率が設定されている */
export function hasChargeProbability(data) {
  return isNormalState(data.stateType) && (data.chargeProbability ?? 0) > 0;
}

/** 大当たり・チャージの合算確率分母（1/N の N） */
export function calcCombinedJackpotDenominator(jackpotProbability, chargeProbability) {
  const j = Number(jackpotProbability) || 0;
  const c = Number(chargeProbability) || 0;
  if (j <= 0 && c <= 0) return null;
  if (c <= 0) return j > 0 ? j : null;
  if (j <= 0) return c;
  return 1 / (1 / j + 1 / c);
}

export function formatProbabilityDenominator(denominator) {
  const n = Number(denominator);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (Number.isInteger(n)) return `1/${n}`;
  return `1/${parseFloat(n.toPrecision(10))}`;
}

export function formatCombinedJackpotProb(jackpotProbability, chargeProbability) {
  const denom = calcCombinedJackpotDenominator(jackpotProbability, chargeProbability);
  return formatProbabilityDenominator(denom);
}

export function isRushFall(stateType) {
  return stateType === 'rush_fall';
}

export function isRushState(stateType) {
  return stateType === 'rush' || stateType === 'rush_fall';
}

/** 時短・RUSH中は玉を消費しない */
export function consumesBalls(stateType) {
  return stateType === 'normal';
}

export function hasLimitedSpins(data) {
  return !isRushFall(data.stateType) && (data.spins ?? 0) > 0;
}

export const STATE_TYPE_LABELS = Object.fromEntries(
  STATE_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

export const EVENT_TYPE_OPTIONS = [
  { value: 'reach', label: 'リーチ' },
  { value: 'miss', label: 'ハズレ' },
  { value: 'continuation', label: '継続' },
];
