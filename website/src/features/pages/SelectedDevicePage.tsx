import React, { useEffect, useState } from "react";
import { getDevice } from "../../api";
import { Device, DeviceReading } from "../../utils/types";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { Button, CircularProgress } from "@mui/material";
import { convertMsToString } from "../../utils/time.utils";
import DeviceDataTable from "../selectedDevice/DeviceDataTable";
import EditDevicePopup from "../selectedDevice/EditDevicePopup";
import DisableDevicePopup from "../selectedDevice/DisableDevicePopup";

type Props = {};

export default function SelectedDevicePage({}: Props) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [device, setDevice] = useState<Device | null>(null);

  const setNewDevice = (device: Device | null) => {
    console.log(device);
    if (device == null) {
      navigate("/");
    }
    setDevice(device);
  };

  const [editDevicePopupOpen, setEditDevicePopupOpen] =
    useState<boolean>(false);
  const [disableDevicePopupOpen, setDisableDevicePopupOpen] =
    useState<boolean>(false);

  const hasReadings = !!device?.lastSynced;

  useEffect(() => {
    if (!id) return;
    // console.log('USER DATA TABLE');
    setLoading(true);
    getDevice(id)
      .then((device) => {
        setDevice(device);
        setLoading(false);
      })
      .catch((err) => {
        console.log("ERROR", err);
        setDevice(null);
        setLoading(false);
      });
  }, [id]);

  const formatTime = (time: string | null, defaultValue: string) => {
    return time ? moment(time).fromNow() : defaultValue;
  };

  if (!id) return <div>No device id provided</div>;
  if (loading) return <CircularProgress />;
  if (!device) return <div>Device not found</div>;
  return (
    <div>
      <h1>{device.name}</h1>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setEditDevicePopupOpen(true)}
      >
        Edit Device
      </Button>
      {(device.lastReset !== null || !hasReadings) && (
        <Button
          variant="contained"
          color="error"
          onClick={() => setDisableDevicePopupOpen(true)}
        >
          {hasReadings ? "Disable Device" : "Delete Device"}
        </Button>
      )}
      <div style={{ textAlign: "center" }}>
        Last Synced: {formatTime(device.lastSynced, "Never Synced")}
      </div>
      <div style={{ textAlign: "center" }}>
        Last Reset: {formatTime(device.lastReset, "Disabled")}
      </div>
      <div style={{ textAlign: "center" }}>
        Reading Interval: {convertMsToString(device.interval)}
      </div>
      <DeviceDataTable
        deviceId={device.id}
        clearLastSynced={() => setNewDevice({ ...device, lastSynced: null })}
      />
      <EditDevicePopup
        device={device}
        setDevice={setNewDevice}
        open={editDevicePopupOpen}
        handleClose={() => setEditDevicePopupOpen(false)}
      />
      <DisableDevicePopup
        hasReadings={hasReadings}
        device={device}
        setDevice={setNewDevice}
        open={disableDevicePopupOpen}
        handleClose={() => setDisableDevicePopupOpen(false)}
      />
      {/*       
      <UserGraphs userData={userData} />
      <UserDataTable
        userData={userData}
        userId={id}
        setNewReadings={setUserData}
      /> */}
    </div>
  );
}
