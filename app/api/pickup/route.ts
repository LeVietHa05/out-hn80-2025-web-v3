// app/api/pickup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/file";
import { Student, Menu, Vote, StudentPickupRequest, MenuVote, FoodQueueItem } from "@/type";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { studentId, date, type }: StudentPickupRequest = body;

        // Validate input
        if (!studentId || !date || !type) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Load data
        const studentsData = readJSON("students.json") || { students: [] };
        const votesData = readJSON("votes.json") || [];
        const menusData = readJSON("menus.json") || { menus: [] };
        const queueData = readJSON("queue.json") || { queue: [], completed: [] };

        // Check if student exists
        const student = studentsData.students.find((s: Student) => s.studentId === studentId);
        if (!student) {
            return NextResponse.json(
                { error: "Student not found" },
                { status: 404 }
            );
        }

        // Find the vote for the date and type
        const vote = votesData.find((v: Vote) => v.date === date && v.type === type);
        if (!vote) {
            return NextResponse.json(
                { error: "No vote found for this date and type" },
                { status: 404 }
            );
        }

        // Find menu details
        const menu = menusData.menus.find((m: Menu) => m.menuId === vote.winner);
        if (!menu) {
            return NextResponse.json(
                { error: "Menu not found" },
                { status: 404 }
            );
        }

        // Get student's menu config for this menu
        const menuConfig = student.menuConfigs?.[menu.menuId];
        if (!menuConfig) {
            return NextResponse.json(
                { error: "Menu configuration not found for student" },
                { status: 400 }
            );
        }


        // Check if already in queue
        const existingInQueue = queueData.queue.find((item: FoodQueueItem) =>
            item.studentId === studentId && item.date === date && item.type === type
        );

        if (existingInQueue) {
            return NextResponse.json(
                { error: "Already in queue", queueItem: existingInQueue },
                { status: 400 }
            );
        }

        // Calculate food slots (priority: 2,5,8 for 3 items)
        const foodItems = menu.items;
        let foodSlots = "";

        if (foodItems.length === 1) {
            // Single item: use slot 2
            const foodKey = foodItems[0].itemId;
            const weight = menuConfig[foodKey]?.rawWeight || 150; // default 150g
            foodSlots = `2,${weight}`;
        } else if (foodItems.length === 2) {
            // Two items: use slots 2 and 5
            const food1Key = foodItems[0].itemId;
            const weight1 = menuConfig[food1Key]?.rawWeight || 150;
            const food2Key = foodItems[1].itemId;
            const weight2 = menuConfig[food2Key]?.rawWeight || 150;
            foodSlots = `2,${weight1};5,${weight2}`;
        } else if (foodItems.length >= 3) {
            // Three or more items: use slots 2, 5, 8 (first 3 items)
            const food1Key = foodItems[0].itemId;
            const weight1 = menuConfig[food1Key]?.rawWeight || 150;
            const food2Key = foodItems[1].itemId;
            const weight2 = menuConfig[food2Key]?.rawWeight || 150;
            const food3Key = foodItems[2].itemId;
            const weight3 = menuConfig[food3Key]?.rawWeight || 150;
            foodSlots = `2,${weight1};5,${weight2};8,${weight3}`;
        }

        // Create queue item
        const queueItem = {
            studentId,
            studentName: student.name,
            date,
            type,
            menuId: menu.menuId,
            menuName: menu.name,
            foodSlots,
            status: "pending" as const,
            createdAt: new Date().toISOString()
        };

        // Add to queue
        queueData.queue.push(queueItem);
        writeJSON("queue.json", queueData);

        return NextResponse.json({
            success: true,
            message: "Added to queue",
            queueItem,
            estimatedTime: queueData.queue.length * 60 // 60 seconds per student
        });

    } catch (error) {
        console.error("Pickup error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}