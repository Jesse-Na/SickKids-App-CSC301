import React from "react";
import { Admin } from "../../utils/types";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

import { createAdminAccount } from "../../api";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onCreated: (admin: Admin) => void;
};

export default function CreateAdminDialog({ open, setOpen, onCreated }: Props) {
  const [email, setEmail] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleCreate = () => {
    setLoading(true);
    createAdminAccount(email)
      .then((data) => {
        onCreated(data);
        setOpen(false);
      })
      .catch((err) => {
        setError(err.message);
        console.log(error);
        setLoading(false);
      });
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>Invite Admin</DialogTitle>
      <DialogContent>
        <Typography>
          Enter the email address of the person you would like to invite to be
          an admin. They will receive an email with instructions on how to
          create an account.
        </Typography>

        <TextField
          autoFocus
          margin="dense"
          id="username"
          label="Email Address"
          type="text"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

      </DialogContent>

      <DialogActions>
        <Button onClick={handleCreate} variant="contained" disabled={loading}>
          Invite
        </Button>
      </DialogActions>
    </Dialog>
  );
}
