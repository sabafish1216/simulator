import { createSlice } from '@reduxjs/toolkit';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { hasLimitedSpins, isRushFall, hasChargeProbability } from '../constants/nodeDefaults';
import { layoutFlowNodes } from '../utils/flowLayout';

function stripEventNodes(nodes, edges) {
  const removedIds = new Set(nodes.filter((node) => node.type === 'event').map((node) => node.id));
  if (removedIds.size === 0) return { nodes, edges };

  return {
    nodes: nodes.filter((node) => !removedIds.has(node.id)),
    edges: edges.filter((edge) => !removedIds.has(edge.source) && !removedIds.has(edge.target)),
  };
}

const initialNodes = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 250, y: 50 },
    data: { label: '開始' },
  },
];

const DEFAULT_EDGE_STYLE = {
  type: 'smoothstep',
  pathOptions: { borderRadius: 16 },
};

const initialState = {
  nodes: initialNodes,
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
};

const flowSlice = createSlice({
  name: 'flow',
  initialState,
  reducers: {
    onNodesChange: (state, action) => {
      state.nodes = applyNodeChanges(action.payload, state.nodes);
    },
    onEdgesChange: (state, action) => {
      state.edges = applyEdgeChanges(action.payload, state.edges);
    },
    onConnect: (state, action) => {
      const connection = { ...action.payload };
      const sourceNode = state.nodes.find((n) => n.id === connection.source);
      if (sourceNode?.type === 'state' && !connection.sourceHandle) {
        const dualHandles =
          hasLimitedSpins(sourceNode.data) ||
          isRushFall(sourceNode.data.stateType) ||
          hasChargeProbability(sourceNode.data);
        if (!dualHandles) {
          connection.sourceHandle = 'jackpot';
        }
      }
      state.edges = addEdge(
        { ...DEFAULT_EDGE_STYLE, ...connection },
        state.edges,
      );
    },
    setViewport: (state, action) => {
      state.viewport = action.payload;
    },
    addNode: (state, action) => {
      state.nodes.push(action.payload);
    },
    selectNode: (state, action) => {
      const id = action.payload;
      state.nodes = state.nodes.map((node) => ({
        ...node,
        selected: node.id === id,
      }));
    },
    removeNode: (state, action) => {
      const id = action.payload;
      const node = state.nodes.find((n) => n.id === id);
      if (!node || node.type === 'start') return;
      state.nodes = state.nodes.filter((n) => n.id !== id);
      state.edges = state.edges.filter((e) => e.source !== id && e.target !== id);
    },
    updateNodeData: (state, action) => {
      const { id, data } = action.payload;
      const node = state.nodes.find((n) => n.id === id);
      if (node) {
        node.data = { ...node.data, ...data };
        if (!hasLimitedSpins(node.data)) {
          state.edges = state.edges.filter(
            (e) => !(e.source === id && e.sourceHandle === 'noWin'),
          );
        }
        if (!isRushFall(node.data.stateType)) {
          state.edges = state.edges.filter(
            (e) => !(e.source === id && e.sourceHandle === 'fall'),
          );
        }
        if (!hasChargeProbability(node.data)) {
          state.edges = state.edges.filter(
            (e) => !(e.source === id && e.sourceHandle === 'charge'),
          );
        }
      }
    },
    setJackpotDistributions: (state, action) => {
      const { nodeId, distributions } = action.payload;
      const node = state.nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const oldIds = new Set((node.data.distributions || []).map((d) => d.id));
      const newIds = new Set(distributions.map((d) => d.id));
      const removedIds = [...oldIds].filter((id) => !newIds.has(id));

      node.data.distributions = distributions;
      if (removedIds.length > 0) {
        state.edges = state.edges.filter(
          (e) => !(e.source === nodeId && removedIds.includes(e.sourceHandle)),
        );
      }
    },
    setSourceHandleTarget: (state, action) => {
      const { sourceNodeId, sourceHandle, targetNodeId } = action.payload;
      state.edges = state.edges.filter((e) => {
        if (e.source !== sourceNodeId) return true;
        if (e.sourceHandle === sourceHandle) return false;
        // レガシー接続（sourceHandle なし）も大当たり指定時は置き換える
        if (sourceHandle === 'jackpot' && !e.sourceHandle) return false;
        return true;
      });
      if (targetNodeId) {
        state.edges.push({
          ...DEFAULT_EDGE_STYLE,
          id: `e-${sourceNodeId}-${sourceHandle}-${targetNodeId}`,
          source: sourceNodeId,
          sourceHandle,
          target: targetNodeId,
          targetHandle: null,
        });
      }
    },
    resetFlow: () => initialState,
    layoutFlow: (state) => {
      state.nodes = layoutFlowNodes(state.nodes, state.edges);
    },
    loadFlowData: (state, action) => {
      const { nodes, edges, viewport } = action.payload;
      const cleaned = stripEventNodes(nodes, edges);
      state.nodes = cleaned.nodes;
      state.edges = cleaned.edges;
      state.viewport = viewport ?? { x: 0, y: 0, zoom: 1 };
    },
  },
});

export const {
  onNodesChange,
  onEdgesChange,
  onConnect,
  setViewport,
  addNode,
  selectNode,
  removeNode,
  updateNodeData,
  setJackpotDistributions,
  setSourceHandleTarget,
  resetFlow,
  layoutFlow,
  loadFlowData,
} = flowSlice.actions;

export const getDefaultFlowState = () => ({
  nodes: initialNodes.map((n) => ({ ...n, data: { ...n.data } })),
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});

export default flowSlice.reducer;
