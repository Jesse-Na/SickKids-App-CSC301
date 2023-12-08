import AsyncStorage from "@react-native-async-storage/async-storage";

export type UsageReport = {
  date: string;
  minutesWorn: number;
};

//retrieves all usage reports from storage
export const getAllReports = async (): Promise<UsageReport[]> => {
  const storage = await AsyncStorage.getItem("usageReports");
  if (storage) {
    return JSON.parse(storage);
  } else {
    return [];
  }
};

// add a new usage report to the storage of the mobile app
export const addReport = async (report: UsageReport) => {
  const reports = await getAllReports();
  const newReports = [...reports.filter((r) => r.date !== report.date), report];
  await AsyncStorage.setItem("usageReports", JSON.stringify(newReports));
  return newReports;
};

// remove a usage report with the specified date from storage
export const removeReport = async (date: string) => {
  const reports = await getAllReports();
  const newReports = reports.filter((report) => report.date !== date);
  await AsyncStorage.setItem("usageReports", JSON.stringify(newReports));
  return newReports;
};
