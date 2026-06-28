export const FLOW_FILE_VERSION = 1;

export function buildFlowExportPayload({ name, nodes, edges, viewport }) {
  return {
    version: FLOW_FILE_VERSION,
    app: 'simulate-simulator',
    name: name?.trim() || 'エクスポート',
    exportedAt: new Date().toISOString(),
    nodes,
    edges,
    viewport: viewport ?? { x: 0, y: 0, zoom: 1 },
  };
}

export function parseFlowFile(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('JSON ファイルとして読み込めません');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('フローファイルの形式が不正です');
  }

  if (!Array.isArray(data.nodes) || data.nodes.length === 0) {
    throw new Error('ノード情報が含まれていません');
  }

  if (!Array.isArray(data.edges)) {
    throw new Error('接続情報が含まれていません');
  }

  const hasStart = data.nodes.some((node) => node?.type === 'start');
  if (!hasStart) {
    throw new Error('開始ノードが含まれているフローファイルが必要です');
  }

  return {
    name: typeof data.name === 'string' ? data.name : 'インポート',
    nodes: data.nodes,
    edges: data.edges,
    viewport: data.viewport ?? { x: 0, y: 0, zoom: 1 },
  };
}

export function downloadFlowFile(payload) {
  const safeName = payload.name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'flow';
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeName}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
