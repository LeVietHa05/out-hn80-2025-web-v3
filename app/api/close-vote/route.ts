import { NextResponse, NextRequest } from "next/server";
import { readJSON, writeJSON } from "@/lib/file";
import { Vote, MenuVote, Student, Menu, MenuItem } from "@/type";

export async function POST(req: NextRequest) {
    const url = req.nextUrl;
    const date = url.searchParams.get("date") || "";
    const type = url.searchParams.get("type") || "";

    //read raw data
    const votes = readJSON("votes.json");
    const students = readJSON("students.json");
    const menusRaw = readJSON("menus.json");
    const menus = menusRaw.menus

    const record = votes.find(
        (v: Vote) => v.date === date && v.type === type
    );

    let winnerMenu = record.menus[0];

    record.menus.forEach((m: MenuVote) => {
        if (m.votedStudentIds.length > winnerMenu.votedStudentIds.length) {
            winnerMenu = m;
        }
    });

    const items: Record<string, string> = {};
    const menu = menus.find((menu: Menu) => menu.menuId == winnerMenu.menuId)
    menu.items.forEach((item: MenuItem) => {
        items[item.itemId] = item.name
    })


    const totalRaw: Record<string, number> = {};

    students.students.forEach((student: Student) => {
        // const student = students.students.find(
        //     (s: Student) => s.studentId === studentId
        // );
        const config = student.menuConfigs[winnerMenu.menuId];

        for (const foodId in config) {
            totalRaw[items[foodId]] =
                (totalRaw[items[foodId]] || 0) + config[foodId].rawWeight;
        }
    });

    record.winner = winnerMenu.menuId;
    record.totalRaw = totalRaw;

    writeJSON("votes.json", votes);

    return NextResponse.json({
        winner: record.winner,
        totalRaw
    });
}
