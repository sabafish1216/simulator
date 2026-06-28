import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

function DeleteNodeConfirmDialog({ open, nodeLabel, onCancel, onConfirm }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>ノードを削除</DialogTitle>
      <DialogContent>
        <DialogContentText>
          「{nodeLabel}」を削除しますか？接続されているエッジも削除されます。
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel}>キャンセル</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          削除
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteNodeConfirmDialog;
