// app/api/nhakho/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/file";

const FILE = "warehouse.json";

// Interface cho dữ liệu kho
interface WarehouseData {
    timestamp: string;
    temperature: number;
    humidity: number;
    motionDetected: boolean;
    fanStatus: boolean;
    lightStatus: boolean;
    doorStatus: boolean;
}

interface alert {
    type: string,
    message: string,
    timestamp: string,
    severity: string
}

interface esp32data {
    temp: string,
    hum: string,
    pir: string,
    relay: string,
    light: string,
    door: string,
}

// GET - Lấy dữ liệu mới nhất
export async function GET(req: NextRequest) {
    try {
        const data = readJSON(FILE) || {
            current: null,
            history: []
        };

        // Trả về dữ liệu mới nhất
        if (data.current) {
            return NextResponse.json(data.current);
        }

        // Nếu chưa có dữ liệu, trả về mock data
        return NextResponse.json({
            timestamp: new Date().toISOString(),
            temperature: 25.0,
            humidity: 60,
            motionDetected: false,
            fanStatus: true,
            lightStatus: false,
            doorStatus: false
        });
    } catch (error) {
        console.error("Error reading warehouse data:", error);
        return NextResponse.json(
            { error: "Failed to read warehouse data" },
            { status: 500 }
        );
    }
}

// POST - Nhận dữ liệu từ ESP32
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Log raw body để debug
        console.log("Received data from ESP32:", body);

        // Parse dữ liệu từ ESP32
        // Format 1: Có trường "message" (như trong code ESP32 của bạn)
        if (body.message) {
            try {
                // Parse JSON string từ trường message
                const espData = JSON.parse(body.message);
                return processWarehouseData(espData);
            } catch (parseError) {
                console.error("Error parsing message field:", parseError);
            }
        }

        // Format 2: Dữ liệu trực tiếp (nếu ESP32 gửi JSON trực tiếp)
        if (body.temp !== undefined || body.hum !== undefined) {
            return processWarehouseData(body);
        }

        // Format không hợp lệ
        return NextResponse.json(
            { error: "Invalid data format" },
            { status: 400 }
        );

    } catch (error) {
        console.error("Error processing warehouse data:", error);
        return NextResponse.json(
            { error: "Failed to process warehouse data" },
            { status: 500 }
        );
    }
}

// Xử lý và lưu dữ liệu kho
function processWarehouseData(espData: esp32data) {
    // Map dữ liệu từ ESP32 sang interface của chúng ta
    const warehouseData: WarehouseData = {
        timestamp: new Date().toISOString(),
        temperature: parseFloat(espData.temp) || 0,
        humidity: parseFloat(espData.hum) || 0,
        motionDetected: Boolean(espData.pir) || false,
        fanStatus: Boolean(espData.relay) || false,
        lightStatus: Boolean(espData.light) || false,
        doorStatus: Boolean(espData.door) || false
    };

    console.log("Processed warehouse data:", warehouseData);

    // Đọc dữ liệu hiện tại
    const existingData = readJSON(FILE) || {
        current: null,
        history: [],
        alerts: []
    };

    // Kiểm tra và tạo cảnh báo nếu cần
    checkAndCreateAlerts(warehouseData, existingData.alerts);

    // Cập nhật dữ liệu
    const updatedData = {
        current: warehouseData,
        history: [...(existingData.history || []), warehouseData].slice(-100), // Giữ 1000 bản ghi gần nhất
        alerts: existingData.alerts,
        lastUpdated: new Date().toISOString()
    };

    // Lưu vào file
    writeJSON(FILE, updatedData);

    return NextResponse.json({
        success: true,
        message: "Warehouse data saved successfully",
        data: warehouseData
    });
}

// Kiểm tra và tạo cảnh báo
function checkAndCreateAlerts(data: WarehouseData, existingAlerts: alert[] = []) {
    const alerts = [...existingAlerts];
    const now = new Date();

    // Giới hạn số lượng cảnh báo
    const maxAlerts = 50;

    // Kiểm tra nhiệt độ cao
    if (data.temperature > 30) {
        const alertExists = alerts.some(alert =>
            alert.type === 'high_temperature' &&
            (now.getTime() - new Date(alert.timestamp).getTime()) < 30 * 60 * 1000 // 30 phút
        );

        if (!alertExists) {
            alerts.push({
                type: 'high_temperature',
                message: `Nhiệt độ quá cao: ${data.temperature}°C`,
                timestamp: data.timestamp,
                severity: 'high'
            });
        }
    }

    // Kiểm tra độ ẩm cao
    if (data.humidity > 80) {
        const alertExists = alerts.some(alert =>
            alert.type === 'high_humidity' &&
            (now.getTime() - new Date(alert.timestamp).getTime()) < 30 * 60 * 1000 // 30 phút
        );

        if (!alertExists) {
            alerts.push({
                type: 'high_humidity',
                message: `Độ ẩm quá cao: ${data.humidity}%`,
                timestamp: data.timestamp,
                severity: 'high'
            });
        }
    }

    // Kiểm tra chuyển động
    if (data.motionDetected) {
        const alertExists = alerts.some(alert =>
            alert.type === 'motion_detected' &&
            (now.getTime() - new Date(alert.timestamp).getTime()) < 5 * 60 * 1000 // 5 phút
        );

        if (!alertExists) {
            alerts.push({
                type: 'motion_detected',
                message: 'Phát hiện chuyển động trong kho',
                timestamp: data.timestamp,
                severity: 'critical'
            });
        }
    }

    // Giữ số lượng cảnh báo tối đa
    return alerts.slice(-maxAlerts);
}

// GET endpoint để lấy lịch sử cảnh báo (tùy chọn)
export async function GET_ALERTS() {
    try {
        const data = readJSON(FILE) || { alerts: [] };
        return NextResponse.json(data.alerts || []);
    } catch (error) {
        console.error("Error reading alerts:", error);
        return NextResponse.json(
            { error: "Failed to read alerts" },
            { status: 500 }
        );
    }
}

// Structure của warehouse.json
/*
{
  "current": {
    "timestamp": "2024-01-15T14:30:00.000Z",
    "temperature": 25.5,
    "humidity": 65,
    "motionDetected": false,
    "fanStatus": true,
    "lightStatus": false,
    "doorStatus": false
  },
  "history": [...], // Lịch sử 1000 bản ghi gần nhất
  "alerts": [
    {
      "type": "high_temperature",
      "message": "Nhiệt độ quá cao: 32°C",
      "timestamp": "2024-01-15T14:30:00.000Z",
      "severity": "high"
    }
  ],
  "lastUpdated": "2024-01-15T14:30:00.000Z"
}
*/