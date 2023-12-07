import React, { useEffect } from "react";
import { deleteAdminAccount, getAllAdmins } from "../../api";
import AdminTable from "../admins/AdminTable";
import CreateAdminDialog from "../admins/CreateAdminDialog";
import { Admin } from "../../utils/types";

type Props = {};

export default function Admins({}: Props) {
  const [open, setOpen] = React.useState(false);
  const [admins, setAdmins] = React.useState<any[]>([]);
  useEffect(() => {
    getAllAdmins()
      .then((data) => {
        console.log(data);
        setAdmins(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  const deleteAdmin = (username: string) => {
    deleteAdminAccount(username)
      .then(() => {
        setAdmins(admins.filter((admin) => admin.username !== username));
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const onCreated = (newAdmin: Admin) => setAdmins((a) => [...a, newAdmin]);
  return (
    <div>
      <h1>Admins</h1>
      <AdminTable
        admins={admins}
        deleteAdmin={deleteAdmin}
        inviteAdmin={() => setOpen(true)}
      />
      <CreateAdminDialog open={open} setOpen={setOpen} onCreated={onCreated} />
    </div>
  );
}
