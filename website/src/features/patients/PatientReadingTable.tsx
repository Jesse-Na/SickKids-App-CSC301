import { useEffect, useState } from "react";
import { getPatientReadings } from "../../api";
import { DeviceReading } from "../../utils/types";
import ReadingTable from "../readings/ReadingTable";

type Props = {
  patientId: string;
  clearLastSynced: () => void;
};

export default function PatientReadingTable({
  patientId,
  clearLastSynced,
}: Props) {
  const [data, setData] = useState<DeviceReading[]>([]);

  const loadReadings = () => {
    if (!patientId) return;
    getPatientReadings(patientId).then((readings) => {
      setData(readings);
      if (readings.length === 0) {
        clearLastSynced();
      }
    });
  };

  useEffect(() => {
    loadReadings();
  }, [patientId]);
  return <ReadingTable data={data} reload={loadReadings} fileId={patientId} />;
}
