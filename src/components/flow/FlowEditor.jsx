import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box } from '@mui/material';
import nodeTypes from './nodeTypes';
import FlowSidebar from './FlowSidebar';
import NodePropertyPanel from './NodePropertyPanel';
import {
  onNodesChange,
  onEdgesChange,
  onConnect,
  setViewport,
} from '../../store/flowSlice';

function FlowEditorInner() {
  const dispatch = useDispatch();
  const { nodes, edges, viewport } = useSelector((state) => state.flow);

  const selectedNode = useMemo(() => nodes.find((n) => n.selected), [nodes]);

  const handleNodesChange = useCallback(
    (changes) => dispatch(onNodesChange(changes)),
    [dispatch],
  );

  const handleEdgesChange = useCallback(
    (changes) => dispatch(onEdgesChange(changes)),
    [dispatch],
  );

  const handleConnect = useCallback(
    (connection) => dispatch(onConnect(connection)),
    [dispatch],
  );

  const handleMoveEnd = useCallback(
    (_, newViewport) => dispatch(setViewport(newViewport)),
    [dispatch],
  );

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <FlowSidebar />
      <Box sx={{ flexGrow: 1, height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          onMoveEnd={handleMoveEnd}
          defaultViewport={viewport}
          nodeTypes={nodeTypes}
          colorMode="dark"
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Background gap={20} size={1} color="rgba(238, 241, 248, 0.04)" />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'start':
                  return '#3dd68c';
                case 'state':
                  return '#7c9cff';
                case 'jackpot':
                  return '#ffb547';
                case 'event':
                  return '#f5b942';
                default:
                  return '#5a6278';
              }
            }}
            maskColor="rgba(10, 12, 18, 0.65)"
          />
        </ReactFlow>
      </Box>
      <NodePropertyPanel selectedNode={selectedNode} nodes={nodes} edges={edges} />
    </Box>
  );
}

function FlowEditor() {
  return (
    <ReactFlowProvider>
      <FlowEditorInner />
    </ReactFlowProvider>
  );
}

export default FlowEditor;
