export const BALLS_PER_1000YEN = 250;
export const BALLS_PER_500YEN = 125;
export const YEN_PER_INVESTMENT_UNIT = 500;
export const DEFAULT_ROTATIONS_PER_1000YEN = 18;
export const DEFAULT_ROTATIONS_PER_SECOND = 10;
export const MAX_SPINS = 5_000_000;
export const MAX_TREND_POINTS = 1000;
/** メモリ節約のため、この件数を超えたら均等間引きで圧縮する */
export const TREND_COMPACT_THRESHOLD = MAX_TREND_POINTS * 5;
export const MAX_STEPS_PER_FRAME = 5000;

export function ballsToYen(balls) {
  return (balls / BALLS_PER_500YEN) * YEN_PER_INVESTMENT_UNIT;
}

export function calcBallsPerRotation(rotationsPer1000Yen) {
  return BALLS_PER_1000YEN / rotationsPer1000Yen;
}

/**
 * 全データを maxPoints 個の等幅バケットに分割し、各バケット末尾の点を採用する。
 * 横軸（累計回転数）が均等に並ぶようになる。
 */
export function downsampleTrend(trend, maxPoints = MAX_TREND_POINTS) {
  const n = trend.length;
  if (n === 0) return [];
  if (n <= maxPoints) {
    return trend.map((p) => ({ ...p }));
  }

  const result = [];
  for (let i = 0; i < maxPoints; i += 1) {
    const end = Math.floor(((i + 1) * n) / maxPoints);
    const idx = end - 1;
    result.push({ ...trend[idx] });
  }
  return result;
}

export function measuredProbability(spins, jackpots) {
  if (spins === 0) return null;
  if (jackpots === 0) return { rate: 0, denominator: null };
  const rate = jackpots / spins;
  return { rate, denominator: Math.round(spins / jackpots) };
}

export function formatMeasuredProb(spins, jackpots) {
  const result = measuredProbability(spins, jackpots);
  if (!result) return '—';
  if (result.denominator === null) return '0回';
  return `1/${result.denominator}`;
}

export function buildJackpotBreakdown(jackpotByStateType) {
  return Object.entries(jackpotByStateType)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({ type, count }));
}

export function calcNetYen(stats) {
  return stats.prizeYen - stats.investmentYen;
}

export function formatYen(value, { signed = false } = {}) {
  const rounded = Math.round(value);
  if (signed && rounded > 0) return `+${rounded.toLocaleString()} 円`;
  return `${rounded.toLocaleString()} 円`;
}

export function formatPercent(value) {
  if (!Number.isFinite(value)) return '—';
  return `${(value * 100).toFixed(1)}%`;
}

export const STOPPED_REASON_LABELS = {
  loss_limit: '上限金額到達',
  max_spins: '最大回転数到達',
  completed: '完了',
  error: 'エラー',
};
