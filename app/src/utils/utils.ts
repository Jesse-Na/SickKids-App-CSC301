import base64 from "react-native-base64";
import { Buffer } from "buffer";

export const convertMsToString = (ms: number) => {
  const divisions = [1000, 60, 60, 24, 7, 4, 12, 52];
  const units = ["ms", "sec", "min", "hr", "day", "week", "month", "year"];
  const arr = [];
  let remainder = ms;
  for (let i = 0; i < divisions.length; i++) {
    const division = divisions[i];
    const unit = units[i];
    const value = remainder % division;
    remainder = Math.floor(remainder / division);
    if (value > 0) {
      arr.push(`${value} ${unit}`);
    }
  }
  return arr.reverse().join(", ");
};

export const convertBase64ToHex = (base64Str: string) => {
  const raw = base64.decode(base64Str);
  let hexId = "";
  for (let i = 0; i < raw.length; i++) {
      const hex = raw.charCodeAt(i).toString(16).toUpperCase();
      hexId += hex.length === 2 ? hex : "0" + hex;
  }

  return hexId;
}

export const convertHexToBase64 = (hexString: string) => {
  // Convert hexadecimal string to bytes
  const bytes = Buffer.from(hexString, 'hex');

  // Convert bytes to base64
  const base64String = bytes.toString('base64');

  return base64String;
}

export const convertNumberToHex = (num: number, num_hex_digits: number = 2) => {
  const hex = num.toString(16);

  if (hex.length % num_hex_digits === 0) {
    return hex;
  }

  let padding = ""
  for (let i = 0; i < num_hex_digits - hex.length; i++) {
    padding += "0";
  }

  return padding + hex;
}

export const combineBytes = (bytes: Buffer, from: number, to: number) => {
  return bytes.subarray(from, to).reduce((a, p) => 256 * a + p, 0);
};
