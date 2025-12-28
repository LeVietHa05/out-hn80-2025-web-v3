import { NextResponse } from "next/server";
import { readJSON } from "@/lib/file";
import { Student } from "@/type";

const FILE = "students.json";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } 
) {
    const { id } = await params;
    const data = readJSON(FILE) || { students: [] };
    const student = data.students.find((s: Student) => s.studentId == id)
    return NextResponse.json({ student });
}