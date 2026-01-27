"use client";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler, ChartOptions
} from "chart.js";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface WarehouseData {
    timestamp: string;
    temperature: number;
    humidity: number;
    motionDetected: boolean;
    fanStatus: boolean;
    lightStatus: boolean;
    doorStatus: boolean;
}

export default function WarehousePage() {
    const [currentData, setCurrentData] = useState<WarehouseData | null>(null);
    const [historicalData, setHistoricalData] = useState<WarehouseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h">("1h");

    // Load data on mount
    useEffect(() => {
        loadWarehouseData();

        if (autoRefresh) {
            const interval = setInterval(() => {
                loadWarehouseData();
            }, 10000); // Refresh every 10 seconds

            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const loadWarehouseData = async () => {
        try {
            const response = await fetch("/api/nhakho");
            const data = await response.json();

            if (data && data.timestamp) {
                setCurrentData(data);

                // Add to historical data (keep last 100 records)
                setHistoricalData(prev => {
                    const newData = [...prev, data];
                    return newData.slice(-20);
                });
            }
        } catch (error) {
            console.error("Error loading warehouse data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Prepare chart data
    const getChartData = () => {
        const filteredData = historicalData.slice(-getDataPoints());

        return {
            labels: filteredData.map(d => formatTime(d.timestamp)),
            datasets: [
                {
                    label: 'Nhiệt độ (°C)',
                    data: filteredData.map(d => d.temperature),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y',
                },
                {
                    label: 'Độ ẩm (%)',
                    data: filteredData.map(d => d.humidity),
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1',
                },
            ],
        };
    };

    const getDataPoints = () => {
        switch (timeRange) {
            case "1h": return 60; // 60 minutes
            case "6h": return 72; // 12 per hour * 6
            case "24h": return 96; // 4 per hour * 24
            default: return 60;
        }
    };


    const chartOptions: ChartOptions<'line'> = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            title: {
                display: true,
                text: 'Biểu đồ theo dõi nhiệt độ & độ ẩm',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Nhiệt độ (°C)'
                },
                min: 0,
                max: 50,
                grid: {
                    color: 'rgba(255, 99, 132, 0.1)'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Độ ẩm (%)'
                },
                min: 0,
                max: 100,
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    if (loading && !currentData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold mb-4">Đang kết nối với kho...</div>
                    <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="border-4 border-black bg-white p-6 mb-8 shadow-[8px_8px_0_0_#000]">
                    <h1 className="text-4xl md:text-5xl font-black text-black mb-2">
                        🏭 QUẢN LÝ KHO THỰC PHẨM
                    </h1>
                    <div className="h-2 w-32 bg-blue-400"></div>
                    <p className="mt-4 text-lg font-bold text-gray-700">
                        Hệ thống giám sát nhiệt độ, độ ẩm và an ninh kho
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Current Status */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Current Status Card */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-8 bg-green-400"></div>
                                    <h2 className="text-2xl font-black text-black">📊 TRẠNG THÁI HIỆN TẠI</h2>
                                </div>
                                {currentData && (
                                    <div className="text-sm text-gray-600">
                                        {formatTime(currentData.timestamp)}
                                    </div>
                                )}
                            </div>

                            {currentData ? (
                                <div className="space-y-6">
                                    {/* Temperature */}
                                    <div className="border-2 border-black p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentData.temperature > 30 ? 'bg-red-500' :
                                                    currentData.temperature > 25 ? 'bg-orange-500' : 'bg-green-500'
                                                    } text-white`}>
                                                    <span className="text-xl">🌡️</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-lg">Nhiệt độ</div>
                                                    <div className="text-sm text-gray-600">Kho lạnh</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-black">{currentData.temperature}°C</div>
                                                <div className={`text-sm font-bold ${currentData.temperature > 30 ? 'text-red-600' :
                                                    currentData.temperature > 25 ? 'text-orange-600' : 'text-green-600'
                                                    }`}>
                                                    {currentData.temperature > 30 ? 'QUÁ NÓNG' :
                                                        currentData.temperature > 25 ? 'HƠI NÓNG' : 'BÌNH THƯỜNG'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 h-2">
                                            <div
                                                className={`h-2 ${currentData.temperature > 30 ? 'bg-red-500' :
                                                    currentData.temperature > 25 ? 'bg-orange-500' : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${(currentData.temperature / 50) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Humidity */}
                                    <div className="border-2 border-black p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentData.humidity > 80 ? 'bg-red-500' :
                                                    currentData.humidity > 60 ? 'bg-orange-500' : 'bg-green-500'
                                                    } text-white`}>
                                                    <span className="text-xl">💧</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-lg">Độ ẩm</div>
                                                    <div className="text-sm text-gray-600">Không khí</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-black">{currentData.humidity}%</div>
                                                <div className={`text-sm font-bold ${currentData.humidity > 80 ? 'text-red-600' :
                                                    currentData.humidity > 60 ? 'text-orange-600' : 'text-green-600'
                                                    }`}>
                                                    {currentData.humidity > 80 ? 'QUÁ CAO' :
                                                        currentData.humidity > 60 ? 'CAO' : 'BÌNH THƯỜNG'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 h-2">
                                            <div
                                                className={`h-2 ${currentData.humidity > 80 ? 'bg-red-500' :
                                                    currentData.humidity > 60 ? 'bg-orange-500' : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${currentData.humidity}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Security Status */}
                                    <div className="border-2 border-black p-4">
                                        <div className="font-bold text-lg mb-3">🔒 TRẠNG THÁI AN NINH</div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className={`p-3 text-center ${currentData.motionDetected ? 'bg-red-100 border-red-500' : 'bg-green-100 border-green-500'} border-2`}>
                                                <div className="font-bold mb-1">Chuyển động</div>
                                                <div className={`text-xl font-black ${currentData.motionDetected ? 'text-red-600' : 'text-green-600'}`}>
                                                    {currentData.motionDetected ? 'PHÁT HIỆN' : 'AN TOÀN'}
                                                </div>
                                            </div>
                                            {/* <div className={`p-3 text-center ${currentData.doorStatus ? 'bg-red-100 border-red-500' : 'bg-green-100 border-green-500'} border-2`}>
                                                <div className="font-bold mb-1">Cửa kho</div>
                                                <div className={`text-xl font-black ${currentData.doorStatus ? 'text-red-600' : 'text-green-600'}`}>
                                                    {currentData.doorStatus ? 'MỞ' : 'ĐÓNG'}
                                                </div>
                                            </div> */}
                                        {/* </div>
                                    </div> */}

                                    {/* Equipment Status */}
                                    {/* <div className="border-2 border-black p-4">
                                        <div className="font-bold text-lg mb-3">⚙️ THIẾT BỊ</div>
                                        <div className="grid grid-cols-2 gap-3"> */}
                                            <div className={`p-3 text-center ${currentData.fanStatus ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-500'} border-2`}>
                                                <div className="font-bold mb-1">Quạt thông gió</div>
                                                <div className={`text-xl font-black ${currentData.fanStatus ? 'text-blue-600' : 'text-gray-600'}`}>
                                                    {currentData.fanStatus ? 'BẬT' : 'TẮT'}
                                                </div>
                                            </div>
                                            {/* <div className={`p-3 text-center ${currentData.lightStatus ? 'bg-yellow-100 border-yellow-500' : 'bg-gray-100 border-gray-500'} border-2`}>
                                                <div className="font-bold mb-1">Đèn chiếu sáng</div>
                                                <div className={`text-xl font-black ${currentData.lightStatus ? 'text-yellow-600' : 'text-gray-600'}`}>
                                                    {currentData.lightStatus ? 'BẬT' : 'TẮT'}
                                                </div>
                                            </div> */}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed border-gray-400">
                                    <div className="text-gray-500">Không có dữ liệu từ kho</div>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-yellow-400"></div>
                                <h2 className="text-2xl font-black text-black">🎛️ ĐIỀU KHIỂN</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">Tự động làm mới</span>
                                    <button
                                        onClick={() => setAutoRefresh(!autoRefresh)}
                                        className={`w-12 h-6 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-300'} transition-all`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${autoRefresh ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                    </button>
                                </div>

                                <button
                                    onClick={loadWarehouseData}
                                    className="w-full py-3 bg-black text-white font-bold hover:bg-gray-800 transition-all border-2 border-black"
                                >
                                    🔄 LÀM MỚI DỮ LIỆU
                                </button>

                                <div className="border-2 border-black p-3 bg-blue-50">
                                    <div className="font-bold mb-2">📡 Kết nối</div>
                                    <div className="text-sm text-gray-600">
                                        {autoRefresh ? 'Đang cập nhật tự động (10s)' : 'Cập nhật thủ công'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Charts & History */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Time Range Selector */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-purple-400"></div>
                                <h2 className="text-2xl font-black text-black">📈 BIỂU ĐỒ THEO DÕI</h2>
                            </div>

                            <div className="mb-6">
                                <div className="font-bold mb-3">Chọn khoảng thời gian:</div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setTimeRange("1h")}
                                        className={`px-4 py-2 font-bold border-2 ${timeRange === "1h" ? 'bg-black text-white' : 'bg-white text-black'} border-black`}
                                    >
                                        1 Giờ
                                    </button>
                                    <button
                                        onClick={() => setTimeRange("6h")}
                                        className={`px-4 py-2 font-bold border-2 ${timeRange === "6h" ? 'bg-black text-white' : 'bg-white text-black'} border-black`}
                                    >
                                        6 Giờ
                                    </button>
                                    <button
                                        onClick={() => setTimeRange("24h")}
                                        className={`px-4 py-2 font-bold border-2 ${timeRange === "24h" ? 'bg-black text-white' : 'bg-white text-black'} border-black`}
                                    >
                                        24 Giờ
                                    </button>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="h-[300px]">
                                {historicalData.length > 0 ? (
                                    <Line data={getChartData()} options={chartOptions} />
                                ) : (
                                    <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-400">
                                        <div className="text-gray-500">Đang thu thập dữ liệu...</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Historical Data */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-8 bg-red-400"></div>
                                    <h2 className="text-2xl font-black text-black">📋 LỊCH SỬ DỮ LIỆU</h2>
                                </div>
                                <span className="px-4 py-2 bg-black text-white font-bold">
                                    {historicalData.length} MẪU
                                </span>
                            </div>

                            {historicalData.length === 0 ? (
                                <div className="border-2 border-dashed border-gray-400 p-8 text-center">
                                    <div className="text-gray-500">Chưa có dữ liệu lịch sử</div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-2 border-black">
                                        <thead>
                                            <tr className="bg-black text-white">
                                                <th className="p-3 text-left">Thời gian</th>
                                                <th className="p-3 text-left">🌡️ Nhiệt độ</th>
                                                <th className="p-3 text-left">💧 Độ ẩm</th>
                                                <th className="p-3 text-left">🚶 Chuyển động</th>
                                                <th className="p-3 text-left">🌀 Quạt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historicalData.slice(-10).reverse().map((data, index) => (
                                                <tr key={index} className="border-b border-gray-300 hover:bg-gray-50">
                                                    <td className="p-3 font-mono">{formatTime(data.timestamp)}</td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-3 h-3 rounded-full ${data.temperature > 30 ? 'bg-red-500' :
                                                                data.temperature > 25 ? 'bg-orange-500' : 'bg-green-500'
                                                                }`}></div>
                                                            {data.temperature}°C
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-3 h-3 rounded-full ${data.humidity > 80 ? 'bg-red-500' :
                                                                data.humidity > 60 ? 'bg-orange-500' : 'bg-green-500'
                                                                }`}></div>
                                                            {data.humidity}%
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 text-xs font-bold ${data.motionDetected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                            {data.motionDetected ? 'CÓ' : 'KHÔNG'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 text-xs font-bold ${data.fanStatus ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {data.fanStatus ? 'BẬT' : 'TẮT'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Alerts & Notifications */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-orange-400"></div>
                                <h2 className="text-2xl font-black text-black">⚠️ CẢNH BÁO</h2>
                            </div>

                            <div className="space-y-3">
                                {currentData && currentData.temperature > 30 && (
                                    <div className="border-2 border-red-500 p-3 bg-red-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center">
                                                ⚠️
                                            </div>
                                            <div>
                                                <div className="font-bold text-red-700">NHIỆT ĐỘ QUÁ CAO</div>
                                                <div className="text-sm text-red-600">
                                                    Nhiệt độ kho đang ở {currentData.temperature}°C. Kiểm tra hệ thống làm mát.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentData && currentData.humidity > 80 && (
                                    <div className="border-2 border-red-500 p-3 bg-red-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center">
                                                💧
                                            </div>
                                            <div>
                                                <div className="font-bold text-red-700">ĐỘ ẨM QUÁ CAO</div>
                                                <div className="text-sm text-red-600">
                                                    Độ ẩm đang ở {currentData.humidity}%. Có thể gây ẩm mốc thực phẩm.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentData && currentData.motionDetected && (
                                    <div className="border-2 border-red-500 p-3 bg-red-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center">
                                                🚨
                                            </div>
                                            <div>
                                                <div className="font-bold text-red-700">PHÁT HIỆN CHUYỂN ĐỘNG</div>
                                                <div className="text-sm text-red-600">
                                                    Có chuyển động trong kho. Kiểm tra an ninh ngay.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentData && currentData.doorStatus && (
                                    <div className="border-2 border-orange-500 p-3 bg-orange-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                                                🚪
                                            </div>
                                            <div>
                                                <div className="font-bold text-orange-700">CỬA KHO ĐANG MỞ</div>
                                                <div className="text-sm text-orange-600">
                                                    Cửa kho đang mở. Đóng cửa để đảm bảo nhiệt độ và an ninh.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(!currentData ||
                                    (!currentData.motionDetected &&
                                        currentData.temperature <= 30 &&
                                        currentData.humidity <= 80 &&
                                        !currentData.doorStatus)) && (
                                        <div className="border-2 border-green-500 p-3 bg-green-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                                                    ✓
                                                </div>
                                                <div>
                                                    <div className="font-bold text-green-700">TẤT CẢ ỔN ĐỊNH</div>
                                                    <div className="text-sm text-green-600">
                                                        Kho đang hoạt động bình thường, không có cảnh báo.
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 border-4 border-black bg-white p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="font-bold text-lg mb-2">🏭 Thông tin kho</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Kho lạnh chính</li>
                                <li>• Dung tích: 50m³</li>
                                <li>• Nhiệt độ mục tiêu: 0-5°C</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2">📡 Thiết bị IoT</h3>
                            <p className="text-gray-600">
                                DHT22: Cảm biến nhiệt độ/độ ẩm
                                <br />
                                PIR: Cảm biến chuyển động
                                <br />
                                Relay: Điều khiển quạt/đèn
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2">📞 Liên hệ</h3>
                            <p className="text-gray-600">
                                Kỹ thuật: 0909.xxx.xxx
                                <br />
                                An ninh: 0911.xxx.xxx
                                <br />
                                Cập nhật: {new Date().toLocaleString('vi-VN')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}