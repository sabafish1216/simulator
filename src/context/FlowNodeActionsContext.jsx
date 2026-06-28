import { createContext, useContext } from 'react';

const FlowNodeActionsContext = createContext(null);

export function FlowNodeActionsProvider({ value, children }) {
  return (
    <FlowNodeActionsContext.Provider value={value}>{children}</FlowNodeActionsContext.Provider>
  );
}

export function useFlowNodeActions() {
  return useContext(FlowNodeActionsContext);
}
