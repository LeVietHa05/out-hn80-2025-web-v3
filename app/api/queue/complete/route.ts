// app/api/complete-queue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/file";
import { FoodQueueItem } from "@/type";

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const date = searchParams.get("date");
        const type = searchParams.get("type");

        if (!studentId || !date || !type) {
            return NextResponse.json(
                { error: "Missing parameters" },
                { status: 400 }
            );
        }

        const queueData = readJSON("queue.json") || { queue: [], completed: [] };

        // Find the processing item
        const processingIndex = queueData.queue.findIndex((item: FoodQueueItem) =>
            item.studentId === studentId &&
            item.date === date &&
            item.type === type &&
            item.status === "processing"
        );

        if (processingIndex === -1) {
            return NextResponse.json(
                { error: "Item not found or not processing" },
                { status: 404 }
            );
        }

        // Move from queue to completed
        const completedItem = {
            ...queueData.queue[processingIndex],
            status: "completed" as const,
            completedAt: new Date().toISOString()
        };

        const updatedQueue = queueData.queue.filter((_: FoodQueueItem, index: number) =>
            index !== processingIndex
        );

        const updatedCompleted = [...(queueData.completed || []), completedItem];

        writeJSON("queue.json", {
            queue: updatedQueue,
            completed: updatedCompleted.slice(-100) // Keep last 100 completed
        });

        return NextResponse.json({
            success: true,
            message: "Queue item completed"
        });

    } catch (error) {
        console.error("Complete queue error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}