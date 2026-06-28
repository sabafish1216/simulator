import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Button, Drawer, Paper } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import nodeTypes from './nodeTypes';
import FlowSidebar from './FlowSidebar';
import NodePropertyPanel from './NodePropertyPanel';
import DeleteNodeConfirmDialog from './DeleteNodeConfirmDialog';
import useIsMobile from '../../hooks/useIsMobile';
import { FlowNodeActionsProvider } from '../../context/FlowNodeActionsContext';
import {
  onNodesChange,
  onEdgesChange,
  onConnect,
  setViewport,
  selectNode,
  removeNode,
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
  const [pendingDeleteNodeId, setPendingDeleteNodeId] = useState(null);

  const selectedNode = useMemo(() => nodes.find((n) => n.selected), [nodes]);
  const pendingDeleteNode = useMemo(
    () => nodes.find((n) => n.id === pendingDeleteNodeId) ?? null,
    [nodes, pendingDeleteNodeId],
  );

  const styledEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        type: edge.type === 'smart' ? 'smoothstep' : (edge.type ?? DEFAULT_EDGE_OPTIONS.type),
        pathOptions: edge.pathOptions ?? DEFAULT_EDGE_OPTIONS.pathOptions,
      })),
    [edges],
  );

  const handleEditNode = useCallback(
    (nodeId) => {
      dispatch(selectNode(nodeId));
      if (isMobile) {
        setPropertyOpen(true);
      }
    },
    [dispatch, isMobile],
  );

  const handleDeleteNode = useCallback((nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || node.type === 'start') return;
    setPendingDeleteNodeId(nodeId);
  }, [nodes]);

  const handleCancelDelete = useCallback(() => {
    setPendingDeleteNodeId(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDeleteNodeId) return;
    dispatch(removeNode(pendingDeleteNodeId));
    if (selectedNode?.id === pendingDeleteNodeId) {
      setPropertyOpen(false);
    }
    setPendingDeleteNodeId(null);
  }, [dispatch, pendingDeleteNodeId, selectedNode?.id]);

  const nodeActions = useMemo(
    () => ({
      isMobile,
      onEditNode: handleEditNode,
      onDeleteNode: handleDeleteNode,
    }),
    [isMobile, handleEditNode, handleDeleteNode],
  );

  const handleNodesChange = useCallback(
    (changes) => {
      const removeChanges = changes.filter((change) => change.type === 'remove');
      const otherChanges = changes.filter((change) => change.type !== 'remove');

      if (removeChanges.length > 0) {
        const node = nodes.find((n) => n.id === removeChanges[0].id);
        if (node && node.type !== 'start') {
          setPendingDeleteNodeId(node.id);
        }
      }

      if (otherChanges.length > 0) {
        dispatch(onNodesChange(otherChanges));
      }
    },
    [dispatch, nodes],
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

  const handlePropertyClose = useCallback(() => {
    setPropertyOpen(false);
  }, []);

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
        deleteKeyCode={isMobile ? null : ['Backspace', 'Delete']}
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

  const deleteDialog = (
    <DeleteNodeConfirmDialog
      open={Boolean(pendingDeleteNode)}
      nodeLabel={pendingDeleteNode?.data?.label ?? pendingDeleteNode?.type ?? ''}
      onCancel={handleCancelDelete}
      onConfirm={handleConfirmDelete}
    />
  );

  if (!isMobile) {
    return (
      <FlowNodeActionsProvider value={nodeActions}>
        <Box sx={{ display: 'flex', height: '100%' }}>
          <FlowSidebar />
          {canvas}
          <NodePropertyPanel selectedNode={selectedNode} nodes={nodes} edges={edges} />
        </Box>
        {deleteDialog}
      </FlowNodeActionsProvider>
    );
  }

  return (
    <FlowNodeActionsProvider value={nodeActions}>
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
          <Box sx={{ p: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FolderOpenIcon />}
              onClick={() => setLibraryOpen(true)}
            >
              フロー・追加
            </Button>
          </Box>
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
          onClose={handlePropertyClose}
          PaperProps={{ sx: DRAWER_PAPER_SX }}
        >
          <NodePropertyPanel
            embedded
            selectedNode={selectedNode}
            nodes={nodes}
            edges={edges}
            onClose={handlePropertyClose}
          />
        </Drawer>
      </Box>
      {deleteDialog}
    </FlowNodeActionsProvider>
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

