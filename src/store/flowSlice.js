import { createSlice } from '@reduxjs/toolkit';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import { hasLimitedSpins, isRushFall, hasChargeProbability } from '../constants/nodeDefaults';

const initialNodes = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 250, y: 50 },
    data: { label: '開始' },
  },
];

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
      state.edges = addEdge(connection, state.edges);
    },
    setViewport: (state, action) => {
      state.viewport = action.payload;
    },
    addNode: (state, action) => {
      state.nodes.push(action.payload);
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
          id: `e-${sourceNodeId}-${sourceHandle}-${targetNodeId}`,
          source: sourceNodeId,
          sourceHandle,
          target: targetNodeId,
          targetHandle: null,
        });
      }
    },
    resetFlow: () => initialState,
    loadFlowData: (state, action) => {
      const { nodes, edges, viewport } = action.payload;
      state.nodes = nodes;
      state.edges = edges;
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
  updateNodeData,
  setJackpotDistributions,
  setSourceHandleTarget,
  resetFlow,
  loadFlowData,
} = flowSlice.actions;

export const getDefaultFlowState = () => ({
  nodes: initialNodes.map((n) => ({ ...n, data: { ...n.data } })),
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
});

export default flowSlice.reducer;
