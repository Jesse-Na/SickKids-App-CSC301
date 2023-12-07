import React from "react";
import moment from "moment";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Admin } from "../../utils/types";

type Props = {
  admins: Admin[];
  deleteAdmin: (username: string) => void;
  inviteAdmin: () => void;
};

export default function AdminTable({
  admins,
  deleteAdmin,
  inviteAdmin,
}: Props) {
  const [selectedAdmin, setSelectedAdmin] = React.useState<Admin | null>(null);

  const handleDelete = () => {
    if (selectedAdmin) {
      deleteAdmin(selectedAdmin.username);
      setSelectedAdmin(null);
    }
  };
  const open = Boolean(selectedAdmin);

  return (
    <>
      <TableContainer
        component={Paper}
        style={{
          width: "fit-content",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Table sx={{ minWidth: 200 }} size="small" aria-label="a dense table">
          <TableHead>
            <TableRow style={{ backgroundColor: "#ddd" }}>
              <TableCell style={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Username</TableCell>

              <TableCell style={{ fontWeight: "bold" }}>
                Email Verified
              </TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Created</TableCell>
              <TableCell style={{ fontWeight: "bold" }}>
                Last Modified
              </TableCell>
              <TableCell style={{ fontWeight: "bold" }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {admins.map((row) => (
              <TableRow
                key={row.username}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                style={{
                  cursor: "pointer",
                }}
                onClick={() => setSelectedAdmin(row)}
              >
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.username}</TableCell>

                <TableCell>{row.email_verified ? "Yes" : "No"}</TableCell>
                <TableCell>{moment(row.created).fromNow()}</TableCell>
                <TableCell>{moment(row.lastModified).fromNow()}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div
          style={{
            height: "46px",
            display: "flex",
            justifyContent: "flex-end",
            backgroundColor: "#f5f5f5",
            borderTop: "1px solid #ddd",
          }}
        >
          <div style={{ margin: "8px" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={inviteAdmin}
              style={{
                textTransform: "none",
                fontWeight: "bold",
              }}
              size="small"
            >
              Invite Admin
            </Button>
          </div>
        </div>
      </TableContainer>
      <Dialog open={open} onClose={() => setSelectedAdmin(null)}>
        <DialogTitle>{selectedAdmin?.email}</DialogTitle>
        <DialogContent>
          <div>
            <strong>Username:</strong> {selectedAdmin?.username}
          </div>
          <div>
            <strong>Email Verified:</strong>{" "}
            {selectedAdmin?.email_verified ? "Yes" : "No"}
          </div>
          <div>
            <strong>Created:</strong> {moment(selectedAdmin?.created).fromNow()}
          </div>
          <div>
            <strong>Last Modified:</strong>{" "}
            {moment(selectedAdmin?.lastModified).fromNow()}
          </div>
          <div>
            <strong>Status:</strong> {selectedAdmin?.status}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete Admin
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
