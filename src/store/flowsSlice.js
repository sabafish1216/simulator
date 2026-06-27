import { createSlice, createSelector } from '@reduxjs/toolkit';

function generateFlowId() {
  return `flow-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const initialState = {
  savedFlows: [],
  activeFlowId: null,
  simulatorFlowId: null,
};

const flowsSlice = createSlice({
  name: 'flows',
  initialState,
  reducers: {
    saveFlow: (state, action) => {
      const { id, name, nodes, edges, viewport } = action.payload;
      const now = Date.now();
      const existing = id ? state.savedFlows.find((f) => f.id === id) : null;

      if (existing) {
        existing.name = name;
        existing.nodes = nodes;
        existing.edges = edges;
        existing.viewport = viewport;
        existing.updatedAt = now;
        state.activeFlowId = existing.id;
        state.simulatorFlowId = existing.id;
        return;
      }

      const newId = id ?? generateFlowId();
      state.savedFlows.push({
        id: newId,
        name,
        nodes,
        edges,
        viewport,
        createdAt: now,
        updatedAt: now,
      });
      state.activeFlowId = newId;
      state.simulatorFlowId = newId;
    },
    loadFlow: (state, action) => {
      const flow = state.savedFlows.find((f) => f.id === action.payload);
      if (flow) {
        state.activeFlowId = flow.id;
      }
    },
    deleteFlow: (state, action) => {
      const id = action.payload;
      state.savedFlows = state.savedFlows.filter((f) => f.id !== id);
      if (state.activeFlowId === id) {
        state.activeFlowId = null;
      }
      if (state.simulatorFlowId === id) {
        state.simulatorFlowId = state.savedFlows[0]?.id ?? null;
      }
    },
    setSimulatorFlowId: (state, action) => {
      const exists = state.savedFlows.some((f) => f.id === action.payload);
      if (exists) {
        state.simulatorFlowId = action.payload;
      }
    },
    clearActiveFlow: (state) => {
      state.activeFlowId = null;
    },
    migrateLegacyFlow: (state, action) => {
      if (state.savedFlows.length > 0) return;
      const { nodes, edges, viewport } = action.payload;
      if (!nodes?.length) return;

      const id = generateFlowId();
      const now = Date.now();
      state.savedFlows.push({
        id,
        name: 'マイフロー',
        nodes,
        edges,
        viewport: viewport ?? { x: 0, y: 0, zoom: 1 },
        createdAt: now,
        updatedAt: now,
      });
      state.activeFlowId = id;
      state.simulatorFlowId = id;
    },
  },
});

export const {
  saveFlow,
  loadFlow,
  deleteFlow,
  setSimulatorFlowId,
  clearActiveFlow,
  migrateLegacyFlow,
} = flowsSlice.actions;

export const selectSavedFlows = (state) => state.flows.savedFlows;
export const selectActiveFlowId = (state) => state.flows.activeFlowId;
export const selectSimulatorFlowId = (state) => state.flows.simulatorFlowId;

export const selectActiveFlow = createSelector(
  [selectSavedFlows, selectActiveFlowId],
  (savedFlows, activeFlowId) => savedFlows.find((f) => f.id === activeFlowId) ?? null,
);

export const selectSimulatorFlow = createSelector(
  [selectSavedFlows, selectSimulatorFlowId],
  (savedFlows, simulatorFlowId) => savedFlows.find((f) => f.id === simulatorFlowId) ?? null,
);

export default flowsSlice.reducer;
