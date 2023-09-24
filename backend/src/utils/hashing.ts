import * as crypto from "crypto";

export const hash = (value: string) =>
  crypto.createHmac("sha256", value).digest("base64");

export const generateKey = (
  size: number = 32,
  format: BufferEncoding = "base64"
) => {
  const buffer = crypto.randomBytes(size);
  const key = buffer.toString(format);
  return {
    key,
    hashedKey: hash(key),
  };
};
