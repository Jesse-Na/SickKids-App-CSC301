import React, { useEffect } from "react";
import ReadingsPerDay from "../graphs/ReadingsPerDay";
import { getPatientDailyUsage } from "../../api";

type Props = {
  patientId: string;
};

export default function PatientUsageGraph({ patientId }: Props) {
  const [readingData, setReadingData] = React.useState<
    { count: number; date: string }[]
  >([]);

  useEffect(() => {
    getPatientDailyUsage(patientId, 20).then((data) => {
      console.log(data);
      setReadingData(data);
    });
  }, [patientId]);
  return <ReadingsPerDay readingData={readingData} />;
}
