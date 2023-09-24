import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Device } from "../../utils/types";
import { convertMsToString } from "../../utils/time.utils";
import { disableDevice, updateDevice } from "../../api";

type Props = {
  open: boolean;
  handleClose: () => void;
  device: Device;
  setDevice: (device: Device | null) => void;
  hasReadings: boolean;
};

const DISABLE_CONFIRMATION_TEXT = "disable";
const DELETE_CONFIRMATION_TEXT = "delete";

export default function DisableDevicePopup({
  open,
  handleClose,
  device,
  setDevice,
  hasReadings,
}: Props) {
  const confirmationText = hasReadings
    ? DISABLE_CONFIRMATION_TEXT
    : DELETE_CONFIRMATION_TEXT;
  const [confirmation, setConfirmation] = useState("");

  const handleDisable = () => {
    disableDevice(device.id).then((d) => {
      if (!d) {
        setDevice(null);
      } else {
        setDevice({ ...device, lastReset: null });
      }

      handleClose();
    });
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        {hasReadings ? "Disable Device" : "Delete Device"}
      </DialogTitle>
      <DialogContent>
        <Box>
          <Typography>
            Disabling the device will make it useless until an admin re-enables
            it on their app by connecting to it. This is meant if a device is
            permanently lost to prevent any security issues or if you accidently
            registered a wrong device. Re-enabling is done on the admin app
            (login as admin under settings).
          </Typography>
          <Typography sx={{ pt: 2 }}>
            To {hasReadings ? "disable" : "delete"} please please enter{" "}
            <i>{confirmationText}</i>
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <TextField
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            variant="outlined"
            label={hasReadings ? "Disable Confirmation" : "Delete Confirmation"}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleDisable}
          disabled={confirmation !== confirmationText}
        >
          {hasReadings ? "Disable" : "Delete"} Device
        </Button>
      </DialogActions>
    </Dialog>
  );
}
