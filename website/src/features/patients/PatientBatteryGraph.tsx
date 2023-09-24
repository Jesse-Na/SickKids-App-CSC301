import React, { useEffect } from "react";
import ReadingsPerDay from "../graphs/ReadingsPerDay";
import { getPatientBattery, getPatientDailyUsage } from "../../api";
import BatteryPercentage from "../graphs/BatteryPercentage";

type Props = {
  patientId: string;
};

export default function PatientBatteryGraph({ patientId }: Props) {
  const [batteryData, setBatteryData] = React.useState<
    { battery: number; timestamp: string }[]
  >([]);

  useEffect(() => {
    getPatientBattery(patientId, 20).then((data) => {
      console.log(data);
      setBatteryData(data);
    });
  }, [patientId]);
  return <BatteryPercentage batteryData={batteryData} />;
}
