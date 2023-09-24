import React, { useEffect, useState } from "react";
import { getDeviceReadings } from "../../api";
import { DeviceReading } from "../../utils/types";
import ReadingTable from "../readings/ReadingTable";

type Props = {
  deviceId: string;
  clearLastSynced: () => void;
};

export default function DeviceDataTable({ deviceId, clearLastSynced }: Props) {
  const [data, setData] = useState<DeviceReading[]>([]);

  const loadReadings = () => {
    if (!deviceId) return;
    getDeviceReadings(deviceId).then((readings) => {
      setData(readings);
      if (readings.length === 0) {
        clearLastSynced();
      }
    });
  };

  useEffect(() => {
    loadReadings();
  }, [deviceId]);
  return <ReadingTable data={data} reload={loadReadings} fileId={deviceId} />;
}
