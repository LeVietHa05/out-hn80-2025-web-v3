import { NextResponse, NextRequest } from "next/server";
import { readJSON, writeJSON } from "@/lib/file";
import { Vote, MenuVote, Menu } from "@/type";

const FILE = "votes.json";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'active' hoặc 'closed'

    const votes = readJSON(FILE) || { votes: [] };
    const menus = readJSON("menus.json") || { menus: [] };

    if (status === 'active') {
        const activeVotes = votes.filter((v: Vote) => !v.winner);
        const votesWithItemsName = activeVotes.map((vote: Vote) => ({
            ...vote,
            menus: vote.menus.map((menuVote: MenuVote) => {
                const menu = menus.menus.find((m: Menu) => m.menuId === menuVote.menuId);
                return {
                    ...menuVote,
                    name: menu?.name || menuVote.menuId,
                    items: menu.items
                }
            })
        }))
        return NextResponse.json(votesWithItemsName);
    }

    if (status === 'closed') {
        const closedVotes = votes.filter((v: Vote) => v.winner);
        return NextResponse.json(closedVotes);
    }

    return NextResponse.json(votes);
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
