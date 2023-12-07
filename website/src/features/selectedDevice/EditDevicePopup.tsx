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
import { useEffect, useState } from "react";
import { Device } from "../../utils/types";
import { convertMsToString } from "../../utils/time.utils";
import { updateDevice } from "../../api";

type Props = {
  open: boolean;
  handleClose: () => void;
  device: Device;
  setDevice: (device: Device) => void;
};

export default function EditDevicePopup({
  open,
  handleClose,
  device,
  setDevice,
}: Props) {
  const [name, setName] = useState("");
  const [interval, setInterval] = useState("");
  const [frequency, setFrequency] = useState("");

  useEffect(() => {
    if (open) {
      setName(device.name);
      setInterval(`${device.interval}`);
      setFrequency(`${device.frequency}`);
    }
  }, [open, device]);

  const intervalError =
    Number.isNaN(parseInt(interval)) || parseInt(interval) < 1000;
  const nameError = name.length === 0;
  const frequencyError =
    Number.isNaN(parseInt(frequency)) || parseInt(frequency) < 1;
  const handleSave = () => {
    if (intervalError || nameError || frequencyError) return;
    const parsedInterval = parseInt(interval);
    const parsedFrequency = parseInt(frequency);
    updateDevice(device.id, {
      name,
      interval: parsedInterval,
      frequency: parsedFrequency,
    }).then((device) => {
      setDevice(device);
      handleClose();
    });
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Edit Device</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            label="Device Name"
            error={nameError}
          />
          <TextField
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            variant="outlined"
            label="Reading interval (ms)"
            type="number"
            error={intervalError}
          />
          <TextField
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            variant="outlined"
            label="Questionnaire Frequency (Days)"
            type="number"
            error={frequencyError}
          />
        </Box>
        <Box>
          <Typography>
            Interval is: {convertMsToString(parseInt(interval))}
          </Typography>
          <Typography sx={{ fontSize: "0.8em" }}>
            Note that each reading takes 1 sec so reading with an interval of 1
            sec gives continuous data
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={intervalError || nameError}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
