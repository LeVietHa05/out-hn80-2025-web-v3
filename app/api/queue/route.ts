// app/api/queue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/file";
import { FoodQueueItem } from "@/type";

export async function GET(req: NextRequest) {
    const queueData = readJSON("queue.json") || { queue: [], completed: [] };

    // Get next pending item
    const nextItem = queueData.queue.find((item: FoodQueueItem) => item.status === "pending");

    if (nextItem) {
        // Update status to processing
        const updatedQueue = queueData.queue.map((item: FoodQueueItem) =>
            item === nextItem ? { ...item, status: "processing" } : item
        );

        writeJSON("queue.json", {
            ...queueData,
            queue: updatedQueue
        });

        return NextResponse.json({
            hasItem: true,
            item: nextItem
        });
    }

    return NextResponse.json({
        hasItem: false,
        message: "No items in queue"
    });
}