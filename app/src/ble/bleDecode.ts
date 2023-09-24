import base64 from "react-native-base64";

export const getBatteryFromBase64 = (
  message: string
): {
  charging: boolean;
  percentage: number;
} => {
  const decoded = base64.decode(message);
  const battery: number = !Number.isNaN(decoded.charCodeAt(6))
    ? decoded.charCodeAt(6)
    : 0;
  const isCharging: number = !Number.isNaN(decoded.charCodeAt(7))
    ? decoded.charCodeAt(7)
    : 0;

  return { percentage: battery, charging: isCharging > 0 };
};
