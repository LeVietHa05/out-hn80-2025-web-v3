"use client";
import { useEffect, useState } from "react";
import { Vote } from "@/type";

export default function MaterialsPage() {
    const [completedVotes, setCompletedVotes] = useState<Vote[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [dateFilter, setDateFilter] = useState<string>("all"); // "all", "today", "upcoming"
    const [totalSummary, setTotalSummary] = useState<{ [key: string]: number }>({});

    // Lấy ngày hiện tại
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        loadCompletedVotes();
    }, []);

    useEffect(() => {
        // Tính tổng summary khi dữ liệu thay đổi
        calculateTotalSummary();
    }, [completedVotes, dateFilter, selectedDate]);

    const loadCompletedVotes = async () => {
        try {
            const response = await fetch("/api/votes?status=closed");
            const data = await response.json();

            // Sắp xếp: mới nhất trước, lunch trước dinner cùng ngày
            const sortedVotes = data.sort((a: Vote, b: Vote) => {
                if (a.date !== b.date) {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                }
                // Cùng ngày thì lunch trước dinner
                return a.type === "lunch" ? -1 : 1;
            });

            setCompletedVotes(sortedVotes);
        } catch (error) {
            console.error("Error loading votes:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalSummary = () => {
        const summary: { [key: string]: number } = {};

        let filteredVotes = completedVotes;

        // Áp dụng filter
        if (dateFilter === "today") {
            filteredVotes = completedVotes.filter(vote => vote.date === today);
        } else if (dateFilter === "upcoming") {
            filteredVotes = completedVotes.filter(vote => vote.date >= today);
        }

        if (selectedDate) {
            filteredVotes = filteredVotes.filter(vote => vote.date === selectedDate);
        }

        // Tính tổng cho mỗi nguyên liệu
        filteredVotes.forEach(vote => {
            if (vote.totalRaw && typeof vote.totalRaw === 'object') {
                Object.entries(vote.totalRaw).forEach(([item, weight]) => {
                    summary[item] = (summary[item] || 0) + Number(weight);
                });
            }
        });

        setTotalSummary(summary);
    };

    // Lấy danh sách ngày duy nhất
    const uniqueDates = Array.from(new Set(completedVotes.map(v => v.date)))
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Format số với dấu phân cách
    const formatNumber = (num: number) => {
        return num.toLocaleString('vi-VN');
    };

    // Chuyển gram sang kg
    const gramToKg = (grams: number) => {
        return (grams / 1000).toFixed(2);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold mb-4">Đang tải dữ liệu...</div>
                    <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="border-4 border-black bg-white p-6 mb-8 shadow-[8px_8px_0_0_#000]">
                    <h1 className="text-4xl md:text-5xl font-black text-black mb-2">
                        🥦 TỔNG HỢP NGUYÊN LIỆU
                    </h1>
                    <div className="h-2 w-32 bg-orange-400"></div>
                    <p className="mt-4 text-lg font-bold text-gray-700">
                        Dữ liệu nguyên liệu cần chuẩn bị cho nhà bếp
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Filters & Summary */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Filters */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-blue-400"></div>
                                <h2 className="text-2xl font-black text-black">🔍 LỌC DỮ LIỆU</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block font-bold mb-2">Theo thời gian:</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setDateFilter("all")}
                                            className={`px-4 py-2 font-bold border-2 ${dateFilter === "all" ? 'bg-black text-white' : 'bg-white text-black'} border-black`}
                                        >
                                            Tất cả
                                        </button>
                                        <button
                                            onClick={() => setDateFilter("today")}
                                            className={`px-4 py-2 font-bold border-2 ${dateFilter === "today" ? 'bg-black text-white' : 'bg-white text-black'} border-black`}
                                        >
                                            Hôm nay
                                        </button>
                                        <button
                                            onClick={() => setDateFilter("upcoming")}
                                            className={`px-4 py-2 font-bold border-2 ${dateFilter === "upcoming" ? 'bg-black text-white' : 'bg-white text-black'} border-black`}
                                        >
                                            Sắp tới
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold mb-2">Chọn ngày cụ thể:</label>
                                    <select
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full border-2 border-black p-3 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        <option value="">Tất cả ngày</option>
                                        {uniqueDates.map(date => (
                                            <option key={date} value={date}>
                                                {new Date(date).toLocaleDateString('vi-VN')}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="border-2 border-black p-3 bg-yellow-50">
                                    <div className="font-bold mb-2">📊 Thống kê hiện tại:</div>
                                    <div className="text-sm">
                                        <div className="flex justify-between">
                                            <span>Số bữa ăn:</span>
                                            <span className="font-bold">{completedVotes.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Đang hiển thị:</span>
                                            <span className="font-bold">{Object.keys(totalSummary).length} món</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total Summary */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-green-400"></div>
                                <h2 className="text-2xl font-black text-black">📦 TỔNG CỘNG</h2>
                            </div>

                            {Object.keys(totalSummary).length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-gray-400">
                                    <div className="text-gray-500">Chưa có dữ liệu</div>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    {Object.entries(totalSummary)
                                        .sort(([, weightA], [, weightB]) => weightB - weightA)
                                        .map(([item, totalWeight]) => (
                                            <div key={item} className="border-2 border-black p-3">
                                                <div className="font-bold text-lg mb-1">{item}</div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-gray-100 p-2 border border-black">
                                                        <div className="text-xs text-gray-600">Gram</div>
                                                        <div className="font-bold text-lg">{formatNumber(totalWeight)}g</div>
                                                    </div>
                                                    <div className="bg-orange-100 p-2 border border-black">
                                                        <div className="text-xs text-gray-600">Kilogram</div>
                                                        <div className="font-bold text-lg">{gramToKg(totalWeight)}kg</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* Grand Total */}
                            {Object.keys(totalSummary).length > 0 && (
                                <div className="mt-6 p-4 bg-black text-white">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold">TỔNG KHỐI LƯỢNG:</span>
                                        <div className="text-right">
                                            <div className="text-xl font-black">
                                                {formatNumber(Object.values(totalSummary).reduce((a, b) => a + b, 0))}g
                                            </div>
                                            <div className="text-sm">
                                                ({gramToKg(Object.values(totalSummary).reduce((a, b) => a + b, 0))} kg)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Completed Votes List */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-8 bg-red-400"></div>
                                    <h2 className="text-2xl font-black text-black">📅 BỮA ĂN ĐÃ HOÀN THÀNH</h2>
                                </div>
                                <span className="px-4 py-2 bg-black text-white font-bold">
                                    {completedVotes.length} BỮA
                                </span>
                            </div>

                            {completedVotes.length === 0 ? (
                                <div className="border-2 border-dashed border-gray-400 p-12 text-center">
                                    <div className="text-xl font-bold text-gray-500">Chưa có bữa ăn nào hoàn thành</div>
                                    <p className="text-gray-600 mt-2">Các bữa ăn sẽ hiển thị ở đây sau khi vote kết thúc</p>
                                </div>
                            ) : (
                                <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2">
                                    {completedVotes
                                        .filter(vote => {
                                            if (dateFilter === "today") return vote.date === today;
                                            if (dateFilter === "upcoming") return vote.date >= today;
                                            if (selectedDate) return vote.date === selectedDate;
                                            return true;
                                        })
                                        .map((vote) => (
                                            <div key={`${vote.date}-${vote.type}`} className="border-2 border-black p-4">
                                                {/* Vote Header */}
                                                <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-black">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`px-4 py-2 ${vote.type === 'lunch' ? 'bg-yellow-400' : 'bg-purple-400'} border-2 border-black font-bold`}>
                                                            {vote.type === 'lunch' ? '🍽️ BỮA TRƯA' : '🌙 BỮA TỐI'}
                                                        </div>
                                                        <div>
                                                            <div className="text-xl font-black">{vote.date}</div>
                                                            <div className="text-sm text-gray-600">
                                                                {new Date(vote.date).toLocaleDateString('vi-VN', { weekday: 'long' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-600">Menu thắng</div>
                                                        <div className="font-bold text-lg">{vote.winner}</div>
                                                    </div>
                                                </div>

                                                {/* Total Raw Data */}
                                                {vote.totalRaw && Object.keys(vote.totalRaw).length > 0 ? (
                                                    <div>
                                                        <div className="font-bold mb-3 flex items-center gap-2">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                            </svg>
                                                            Nguyên liệu cần chuẩn bị:
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {Object.entries(vote.totalRaw).map(([item, weight]) => (
                                                                <div key={item} className="border border-black p-3 bg-white">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="font-bold">{item}</span>
                                                                        <div className="text-right">
                                                                            <div className="text-lg font-black">{formatNumber(Number(weight))}g</div>
                                                                            <div className="text-sm text-gray-600">{gramToKg(Number(weight))}kg</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-2">
                                                                        <div className="w-full bg-gray-200 h-2">
                                                                            <div
                                                                                className="bg-green-500 h-2"
                                                                                style={{ width: `${Math.min(100, Number(weight) / 5000 * 100)}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Vote Summary */}
                                                        <div className="mt-4 p-3 bg-gray-100 border border-black">
                                                            <div className="flex justify-between text-sm">
                                                                <span>Tổng số món:</span>
                                                                <span className="font-bold">{Object.keys(vote.totalRaw).length}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span>Tổng khối lượng:</span>
                                                                <span className="font-bold">
                                                                    {formatNumber(Object.values(vote.totalRaw).reduce((a: number, b: number) => a + Number(b), 0))}g
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6 border-2 border-dashed border-gray-400">
                                                        <div className="text-gray-500">Chưa có dữ liệu nguyên liệu cho bữa ăn này</div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        {/* Export Section */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-purple-400"></div>
                                <h2 className="text-2xl font-black text-black">📄 XUẤT DỮ LIỆU</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => {
                                        const dataStr = JSON.stringify(totalSummary, null, 2);
                                        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                                        const link = document.createElement('a');
                                        link.setAttribute('href', dataUri);
                                        link.setAttribute('download', `nguyen-lieu-${new Date().toISOString().split('T')[0]}.json`);
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                    className="border-2 border-black p-4 text-center hover:bg-gray-50 transition-all"
                                >
                                    <div className="text-3xl mb-2">📊</div>
                                    <div className="font-bold">JSON</div>
                                    <div className="text-sm text-gray-600 mt-1">Xuất dữ liệu thô</div>
                                </button>

                                <button
                                    onClick={() => {
                                        let csv = '\ufeff'; // Thêm BOM cho UTF-8
                                        csv += 'Tên món,Tổng gram,Tổng kg\n';

                                        Object.entries(totalSummary).forEach(([item, weight]) => {
                                            // Escape special characters và đảm bảo encoding
                                            const escapedItem = `"${item.replace(/"/g, '""')}"`;
                                            csv += `${escapedItem},${weight},${gramToKg(weight)}\n`;
                                        });

                                        const blob = new Blob([csv], {
                                            type: 'text/csv;charset=utf-8;'
                                        });

                                        const link = document.createElement('a');
                                        const url = URL.createObjectURL(blob);
                                        link.setAttribute('href', url);
                                        link.setAttribute('download', `nguyen-lieu-${new Date().toISOString().split('T')[0]}.csv`);
                                        link.style.visibility = 'hidden';
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                    className="border-2 border-black p-4 text-center hover:bg-gray-50 transition-all"
                                >
                                    <div className="text-3xl mb-2">📈</div>
                                    <div className="font-bold">CSV</div>
                                    <div className="text-sm text-gray-600 mt-1">Excel/Google Sheets</div>
                                </button>

                                <button
                                    onClick={() => {
                                        window.print();
                                    }}
                                    className="border-2 border-black p-4 text-center hover:bg-gray-50 transition-all"
                                >
                                    <div className="text-3xl mb-2">🖨️</div>
                                    <div className="font-bold">IN ẤN</div>
                                    <div className="text-sm text-gray-600 mt-1">Bản in trực tiếp</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 border-4 border-black bg-white p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="font-bold text-lg mb-2">💡 Ghi chú</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Dữ liệu tính theo gram</li>
                                <li>• Chỉ hiển thị bữa ăn đã hoàn thành</li>
                                <li>• Lunch hiển thị trước Dinner</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2">📅 Cập nhật lần cuối</h3>
                            <p className="text-gray-600">{new Date().toLocaleString('vi-VN')}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2">⚙️ Tính toán</h3>
                            <p className="text-gray-600">
                                1kg = 1000g
                                <br />
                                Làm tròn 2 chữ số thập phân
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}