const NODE_DIMENSIONS = {
  start: { width: 120, height: 56 },
  state: { width: 200, height: 150 },
  jackpot: { width: 300, height: 130 },
  default: { width: 160, height: 80 },
};

const HORIZONTAL_GAP = 72;
const VERTICAL_GAP = 96;
const ORIGIN_X = 80;
const ORIGIN_Y = 48;

function getNodeSize(node) {
  return NODE_DIMENSIONS[node.type] ?? NODE_DIMENSIONS.default;
}

function buildAdjacency(nodes, edges) {
  const children = new Map(nodes.map((node) => [node.id, []]));
  const parents = new Map(nodes.map((node) => [node.id, []]));

  edges.forEach((edge) => {
    if (!children.has(edge.source) || !parents.has(edge.target)) return;
    children.get(edge.source).push(edge.target);
    parents.get(edge.target).push(edge.source);
  });

  return { children, parents };
}

function assignRanks(nodes, edges) {
  const { children, parents } = buildAdjacency(nodes, edges);
  const rank = new Map();

  const roots = nodes.filter(
    (node) => node.type === 'start' || parents.get(node.id).length === 0,
  );
  const queue = roots.length > 0 ? [...roots] : [nodes[0]];
  queue.forEach((node) => rank.set(node.id, 0));

  let head = 0;
  while (head < queue.length) {
    const node = queue[head];
    head += 1;
    const nextRank = (rank.get(node.id) ?? 0) + 1;

    for (const childId of children.get(node.id) ?? []) {
      const current = rank.get(childId);
      if (current == null || current < nextRank) {
        rank.set(childId, nextRank);
        const childNode = nodes.find((n) => n.id === childId);
        if (childNode) queue.push(childNode);
      }
    }
  }

  nodes.forEach((node) => {
    if (!rank.has(node.id)) rank.set(node.id, 0);
  });

  return rank;
}

export function layoutFlowNodes(nodes, edges) {
  if (nodes.length === 0) return nodes;

  const rank = assignRanks(nodes, edges);
  const rows = new Map();

  nodes.forEach((node) => {
    const row = rank.get(node.id) ?? 0;
    if (!rows.has(row)) rows.set(row, []);
    rows.get(row).push(node);
  });

  const sortedRanks = [...rows.keys()].sort((a, b) => a - b);
  const rowOffsets = new Map();
  let offsetY = ORIGIN_Y;

  sortedRanks.forEach((rowRank) => {
    rowOffsets.set(rowRank, offsetY);
    const tallest = Math.max(...(rows.get(rowRank) ?? []).map((n) => getNodeSize(n).height));
    offsetY += tallest + VERTICAL_GAP;
  });

  return nodes.map((node) => {
    const row = rank.get(node.id) ?? 0;
    const rowNodes = rows.get(row) ?? [node];
    const sortedRow = [...rowNodes].sort((a, b) => a.id.localeCompare(b.id));
    const index = sortedRow.findIndex((n) => n.id === node.id);
    const rowWidth =
      sortedRow.reduce((sum, rowNode) => sum + getNodeSize(rowNode).width, 0) +
      HORIZONTAL_GAP * Math.max(sortedRow.length - 1, 0);
    const rowStartX = ORIGIN_X + Math.max(0, (960 - rowWidth) / 2);

    let x = rowStartX;
    for (let i = 0; i < index; i += 1) {
      x += getNodeSize(sortedRow[i]).width + HORIZONTAL_GAP;
    }

    return {
      ...node,
      position: { x, y: rowOffsets.get(row) ?? ORIGIN_Y },
    };
  });
}
