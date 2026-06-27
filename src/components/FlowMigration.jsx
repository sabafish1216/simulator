import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { migrateLegacyFlow } from '../store/flowsSlice';

function FlowMigration() {
  const dispatch = useDispatch();
  const savedFlows = useSelector((state) => state.flows.savedFlows);
  const flow = useSelector((state) => state.flow);
  const rehydrated = useSelector((state) => state._persist?.rehydrated);

  useEffect(() => {
    if (!rehydrated) return;
    if (savedFlows.length > 0) return;
    if (!flow.nodes?.length) return;

    dispatch(
      migrateLegacyFlow({
        nodes: flow.nodes,
        edges: flow.edges,
        viewport: flow.viewport,
      }),
    );
  }, [rehydrated, savedFlows.length, dispatch, flow]);

  return null;
}

export default FlowMigration;
