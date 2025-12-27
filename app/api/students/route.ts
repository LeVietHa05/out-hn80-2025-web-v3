import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/file";

const FILE = "students.json";

export async function GET() {
  const data = readJSON(FILE) || { students: [] };
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const data = readJSON(FILE) || { students: [] };
  data.students.push(body);

  writeJSON(FILE, data);

  return NextResponse.json({ success: true });
}
