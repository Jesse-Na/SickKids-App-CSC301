import AsyncStorage from "@react-native-async-storage/async-storage";

export type UsageReport = {
  date: string;
  minutesWorn: number;
};

export const getAllReports = async (): Promise<UsageReport[]> => {
  const storage = await AsyncStorage.getItem("usageReports");
  if (storage) {
    return JSON.parse(storage);
  } else {
    return [];
  }
};

export const addReport = async (report: UsageReport) => {
  const reports = await getAllReports();
  const newReports = [...reports.filter((r) => r.date !== report.date), report];
  await AsyncStorage.setItem("usageReports", JSON.stringify(newReports));
  return newReports;
};

export const removeReport = async (date: string) => {
  const reports = await getAllReports();
  const newReports = reports.filter((report) => report.date !== date);
  await AsyncStorage.setItem("usageReports", JSON.stringify(newReports));
  return newReports;
};
