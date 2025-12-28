import { NextResponse, NextRequest } from "next/server";
import { readJSON, writeJSON } from "@/lib/file";
import { Menu, Vote } from "@/type";

const FILE = "votes.json"

function shuffle<T>(arr: T[]) {
    return [...arr].sort(() => Math.random() - 0.5);
}

export async function GET() {
    const data = readJSON(FILE) || { menus: [] };
    return NextResponse.json(data);
}

//tao vote
export async function POST(req: NextRequest) {
    const url = req.nextUrl;
    const date = url.searchParams.get("date") || "";
    const type = url.searchParams.get("type") || "";

    const menusData = readJSON("menus.json");
    if (!menusData) {
        return NextResponse.json({ error: "No menus" }, { status: 400 });
    }

    const votes = readJSON("votes.json") || [];

    // không tạo trùng ngày + bữa
    const existed = votes.find(
        (v: Vote) => v.date === date && v.type === type
    );
    if (existed) {
        return NextResponse.json(existed.menus);
    }

    const pickedMenus = shuffle(menusData.menus as Menu[])
        .slice(0, 3)
        .map((m: Menu) => ({
            menuId: m.menuId,
            name: m.name,
            votedStudentIds: []
        }));

    votes.push({
        date,
        type,
        menus: pickedMenus,
        winner: null,
        totalRaw: {}
    });

    writeJSON("votes.json", votes);

    return NextResponse.json(pickedMenus);
}
