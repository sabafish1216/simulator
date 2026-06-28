import { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFlowNodeActions } from '../../context/FlowNodeActionsContext';

function NodeActionButton({ nodeId, deletable = true }) {
  const actions = useFlowNodeActions();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  if (!actions) return null;

  const { isMobile, onEditNode, onDeleteNode } = actions;

  const handleOpenMenu = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEdit = (event) => {
    event.stopPropagation();
    handleCloseMenu();
    onEditNode?.(nodeId);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    handleCloseMenu();
    onDeleteNode?.(nodeId);
  };

  const buttonSx = {
    width: 24,
    height: 24,
    bgcolor: 'background.paper',
    border: 1,
    borderColor: 'divider',
    boxShadow: 1,
    '&:hover': { bgcolor: 'action.hover' },
  };

  const positionSx = {
    position: 'absolute',
    top: 6,
    right: 6,
    left: 'auto',
    zIndex: 2,
  };

  if (isMobile) {
    return (
      <>
        <IconButton
          className="nodrag nopan flow-node-action-btn"
          size="small"
          aria-label="ノード操作"
          onClick={handleOpenMenu}
          sx={{
            ...buttonSx,
            ...positionSx,
          }}
        >
          <MoreVertIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { minWidth: 140 } } }}
        >
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>編集</ListItemText>
          </MenuItem>
          {deletable && (
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ color: 'error.main' }}>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>削除</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </>
    );
  }

  if (!deletable) return null;

  return (
    <IconButton
      className="nodrag nopan"
      size="small"
      aria-label="ノードを削除"
      onClick={handleDelete}
      sx={{
        ...buttonSx,
        ...positionSx,
        color: 'error.main',
      }}
    >
      <DeleteIcon sx={{ fontSize: 15 }} />
    </IconButton>
  );
}

export default NodeActionButton;
