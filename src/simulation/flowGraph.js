const SPECIAL_STATE_HANDLES = new Set(['noWin', 'fall', 'charge']);

export function findEdge(edges, sourceId, sourceHandle) {
  const fromSource = edges.filter((e) => e.source === sourceId);

  if (!sourceHandle) {
    return (
      fromSource.find((e) => !e.sourceHandle || e.sourceHandle === 'jackpot') ?? null
    );
  }

  const exact = fromSource.find((e) => e.sourceHandle === sourceHandle);
  if (exact) return exact;

  // ハンドル ID 未設定の旧エッジ（ドラッグ接続）を大当たり遷移として扱う
  if (sourceHandle === 'jackpot') {
    const legacy = fromSource.find((e) => !e.sourceHandle);
    if (legacy) return legacy;

    const candidates = fromSource.filter(
      (e) => !SPECIAL_STATE_HANDLES.has(e.sourceHandle),
    );
    if (candidates.length === 1) return candidates[0];
  }

  return null;
}

export function getTargetNode(nodes, edges, sourceId, sourceHandle) {
  const edge = findEdge(edges, sourceId, sourceHandle);
  if (!edge) return null;
  return nodes.find((n) => n.id === edge.target) ?? null;
}

export function findStartNode(nodes) {
  return nodes.find((n) => n.type === 'start') ?? null;
}

export function resolveStartTarget(nodes, edges) {
  const start = findStartNode(nodes);
  if (!start) return { node: null, error: '開始ノードがありません' };
  const target = getTargetNode(nodes, edges, start.id, null);
  if (!target) return { node: null, error: '開始ノードからの接続がありません' };
  return { node: target, error: null };
}

export function pickDistribution(distributions) {
  const totalWeight = distributions.reduce((sum, d) => sum + (Number(d.weight) || 0), 0);
  if (totalWeight === 0) return null;

  let roll = Math.random() * totalWeight;
  for (const dist of distributions) {
    roll -= Number(dist.weight) || 0;
    if (roll <= 0) return dist;
  }
  return distributions[distributions.length - 1];
}

export function rollProbability(denominator) {
  const n = Number(denominator);
  if (!n || n <= 0) return false;
  return Math.random() < 1 / n;
}
