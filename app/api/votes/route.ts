import { NextResponse, NextRequest } from "next/server";
import { readJSON, writeJSON } from "@/lib/file";
import { Vote, MenuVote } from "@/type";

const FILE = "votes.json";

export async function GET() {
  const data = readJSON(FILE) || { menus: [] };
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    const url = req.nextUrl;
    const date = url.searchParams.get("date") || "";
    const type = url.searchParams.get("type") || "";
    const menuId = url.searchParams.get("menuId") || "";
    const studentId = url.searchParams.get("studentId") || "";

    const votes = readJSON("votes.json") || [];
    const record = votes.find(
        (v: Vote) => v.date === date && v.type === type
    );

    if (!record) {
        return NextResponse.json({ error: "Vote not initialized" }, { status: 400 });
    }

    // remove vote cũ
    record.menus.forEach((m: MenuVote) => {
        m.votedStudentIds = m.votedStudentIds.filter(
            (id: string) => id !== studentId
        );
    });

    // add vote mới
    const targetMenu = record.menus.find((m: MenuVote) => m.menuId === menuId);
    targetMenu.votedStudentIds.push(studentId);

    writeJSON("votes.json", votes);

    return NextResponse.json({ success: true });
}
