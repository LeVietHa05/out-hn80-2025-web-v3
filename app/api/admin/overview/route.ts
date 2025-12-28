import { NextResponse } from "next/server";
import { readJSON } from "@/lib/file";
import { Vote } from "@/type";

export async function GET() {
    const menus = readJSON("menus.json")?.menus || [];
    const students = readJSON("students.json")?.students || [];
    const votes = readJSON("votes.json") || [];

    return NextResponse.json({
        menuCount: menus.length,
        studentCount: students.length,
        activeVotes: votes.filter((v: Vote) => !v.winner)
    });
}
