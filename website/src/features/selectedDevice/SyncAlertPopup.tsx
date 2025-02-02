import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
} from "@mui/material";

import { Device } from "../../utils/types";

type Props = {
  open: boolean;
  handleClose: () => void;
  device: Device;
};

export default function SyncAlertPopup({ open, handleClose, device }: Props) {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Sync Alert</DialogTitle>
      <DialogContent>
        <Typography>
          The device '{device.name}' has not been synced for over 24 hours.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Box display="flex" justifyContent="center" width="100%">
          {" "}
          {/* Use Box to create a flex container */}
          <Button variant="contained" onClick={handleClose}>
            Acknowledge
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
