import fs from "fs";
import path from "path";

export function readJSON(fileName: string) {
  const filePath = path.join(process.cwd(), "data", fileName);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function writeJSON(fileName: string, data: any) {
  const filePath = path.join(process.cwd(), "data", fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
