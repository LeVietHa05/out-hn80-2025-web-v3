import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/file";

const FILE = "menus.json";

export async function GET() {
  const data = readJSON(FILE) || { menus: [] };
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();

  const data = readJSON(FILE) || { menus: [] };

  data.menus.push(body);

  writeJSON(FILE, data);

  return NextResponse.json({ success: true });
}
