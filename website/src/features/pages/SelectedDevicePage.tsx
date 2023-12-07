import { useEffect, useState } from "react";
import { getDevice } from "../../api";
import { Device } from "../../utils/types";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { Button, CircularProgress } from "@mui/material";
import { convertMsToString } from "../../utils/time.utils";
import DeviceDataTable from "../selectedDevice/DeviceDataTable";
import EditDevicePopup from "../selectedDevice/EditDevicePopup";
import DisableDevicePopup from "../selectedDevice/DisableDevicePopup";
import SyncAlertPopup from "../selectedDevice/SyncAlertPopup";

type Props = {};

// const dummyDevice: Device = {
//   id: "test",
//   name: "Test Device",
//   lastSynced: "2021-10-15T19:00:00.000Z",
//   lastReset: "2021-10-15T19:00:00.000Z",
//   interval: 1000 * 60 * 60 * 24,
//   user: "test user",
//   frequency: 1,
// };

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
  const [syncAlertPopupOpen, setSyncAlertPopupOpen] = useState<boolean>(false);

  const hasReadings = !!device?.lastSynced;

  useEffect(() => {
    if (!id) return;
    // console.log('USER DATA TABLE');
    setLoading(true);
    getDevice(id)
      .then((device) => {
        setDevice(device);
        setLoading(false);
        const lastSynced = moment(device.lastSynced);
        if (moment().diff(lastSynced, "hours") > 24) {
          setSyncAlertPopupOpen(true);
        }
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

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => setEditDevicePopupOpen(true)}
          sx={{ margin: 1 }}
        >
          Edit Device
        </Button>

        {(device.lastReset !== null || !hasReadings) && (
          <Button
            variant="contained"
            color="error"
            onClick={() => setDisableDevicePopupOpen(true)}
            sx={{ margin: 1 }}
          >
            {hasReadings ? "Disable Device" : "Delete Device"}
          </Button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          marginBottom: 20,
        }}
      >
        <div style={{ margin: "0 10px", color: "blue" }}>
          Last Synced: {formatTime(device.lastSynced, "Never Synced")}
        </div>
        <div style={{ margin: "0 10px", color: "blue" }}>
          Last Reset: {formatTime(device.lastReset, "Disabled")}
        </div>
        <div style={{ margin: "0 10px", color: "blue" }}>
          Reading Interval: {convertMsToString(device.interval)}
        </div>
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
      <SyncAlertPopup
        open={syncAlertPopupOpen}
        handleClose={() => setSyncAlertPopupOpen(false)}
        device={device}
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
