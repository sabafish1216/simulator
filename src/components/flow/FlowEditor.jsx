import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Button, Drawer, Paper, Stack } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TuneIcon from '@mui/icons-material/Tune';
import nodeTypes from './nodeTypes';
import FlowSidebar from './FlowSidebar';
import NodePropertyPanel from './NodePropertyPanel';
import useIsMobile from '../../hooks/useIsMobile';
import {
  onNodesChange,
  onEdgesChange,
  onConnect,
  setViewport,
} from '../../store/flowSlice';

const DEFAULT_EDGE_OPTIONS = {
  type: 'smoothstep',
  pathOptions: { borderRadius: 16 },
};

const DRAWER_PAPER_SX = {
  maxHeight: '88dvh',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  pb: 'env(safe-area-inset-bottom, 0px)',
};

function FlowEditorInner() {
  const dispatch = useDispatch();
  const isMobile = useIsMobile();
  const { nodes, edges, viewport } = useSelector((state) => state.flow);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [propertyOpen, setPropertyOpen] = useState(false);

  const selectedNode = useMemo(() => nodes.find((n) => n.selected), [nodes]);

  const styledEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: edge.type === 'smart' ? 'smoothstep' : (edge.type ?? DEFAULT_EDGE_OPTIONS.type),
        pathOptions: edge.pathOptions ?? DEFAULT_EDGE_OPTIONS.pathOptions,
      })),
    [edges],
  );

  useEffect(() => {
    if (isMobile && selectedNode) {
      setPropertyOpen(true);
    }
  }, [selectedNode?.id, isMobile, selectedNode]);

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

  const canvas = (
    <Box sx={{ flexGrow: 1, minHeight: 0, height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onMoveEnd={handleMoveEnd}
        defaultViewport={viewport}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        connectionLineType="smoothstep"
        colorMode="dark"
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        panOnScroll={!isMobile}
        zoomOnPinch={isMobile}
        zoomOnScroll={!isMobile}
        preventScrolling={isMobile}
      >
        <Background gap={20} size={1} color="rgba(238, 241, 248, 0.04)" />
        <Controls position={isMobile ? 'top-right' : 'bottom-left'} />
        {!isMobile && (
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
        )}
      </ReactFlow>
    </Box>
  );

  if (!isMobile) {
    return (
      <Box sx={{ display: 'flex', height: '100%' }}>
        <FlowSidebar />
        {canvas}
        <NodePropertyPanel selectedNode={selectedNode} nodes={nodes} edges={edges} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {canvas}

      <Paper
        component="nav"
        elevation={8}
        sx={{
          flexShrink: 0,
          borderTop: 1,
          borderColor: 'divider',
          borderRadius: 0,
          pb: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <Stack direction="row" spacing={1} sx={{ p: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FolderOpenIcon />}
            onClick={() => setLibraryOpen(true)}
          >
            フロー・追加
          </Button>
          <Button
            fullWidth
            variant={selectedNode ? 'contained' : 'outlined'}
            startIcon={<TuneIcon />}
            onClick={() => setPropertyOpen(true)}
            disabled={!selectedNode}
          >
            プロパティ
          </Button>
        </Stack>
      </Paper>

      <Drawer
        anchor="bottom"
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        PaperProps={{ sx: DRAWER_PAPER_SX }}
      >
        <FlowSidebar embedded onClose={() => setLibraryOpen(false)} />
      </Drawer>

      <Drawer
        anchor="bottom"
        open={propertyOpen}
        onClose={() => setPropertyOpen(false)}
        PaperProps={{ sx: DRAWER_PAPER_SX }}
      >
        <NodePropertyPanel
          embedded
          selectedNode={selectedNode}
          nodes={nodes}
          edges={edges}
          onClose={() => setPropertyOpen(false)}
        />
      </Drawer>
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
