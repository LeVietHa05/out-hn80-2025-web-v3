"use client";
import { useEffect, useState } from "react";
import { Student, Vote } from "@/type";

interface StudentStats {
    studentId: string;
    studentName: string;
    totalVotes: number;
    menuVotes: {
        [menuId: string]: {
            menuName: string;
            count: number;
        };
    };
    favoriteMenu: {
        menuName: string;
        count: number;
    };
}

export default function StatisticsPage() {
    const [studentStats, setStudentStats] = useState<StudentStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<"totalVotes" | "name">("totalVotes");
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            // Load all data
            const [studentsRes, votesRes] = await Promise.all([
                fetch("/api/students").then(r => r.json()),
                fetch("/api/votes").then(r => r.json())
            ]);

            const students: Student[] = studentsRes.students || [];
            const votes: Vote[] = votesRes || [];

            // Calculate statistics
            const statsMap = new Map<string, StudentStats>();

            // Initialize all students
            students.forEach(student => {
                statsMap.set(student.studentId, {
                    studentId: student.studentId,
                    studentName: student.name,
                    totalVotes: 0,
                    menuVotes: {},
                    favoriteMenu: { menuName: "Chưa có", count: 0 }
                });
            });

            // Process all votes
            votes.forEach(vote => {
                vote.menus.forEach(menu => {
                    menu.votedStudentIds.forEach(studentId => {
                        const stats = statsMap.get(studentId);
                        if (stats) {
                            // Increment total votes
                            stats.totalVotes++;

                            // Count menu votes
                            if (!stats.menuVotes[menu.menuId]) {
                                stats.menuVotes[menu.menuId] = {
                                    menuName: menu.name,
                                    count: 0
                                };
                            }
                            stats.menuVotes[menu.menuId].count++;
                        }
                    });
                });
            });

            // Calculate favorite menu for each student
            statsMap.forEach(stats => {
                let maxCount = 0;
                let favoriteMenu = { menuName: "Chưa có", count: 0 };

                Object.values(stats.menuVotes).forEach(menu => {
                    if (menu.count > maxCount) {
                        maxCount = menu.count;
                        favoriteMenu = menu;
                    }
                });

                stats.favoriteMenu = favoriteMenu;
            });

            // Convert to array and sort
            const statsArray = Array.from(statsMap.values());
            statsArray.sort((a, b) => b.totalVotes - a.totalVotes);

            setStudentStats(statsArray);
        } catch (error) {
            console.error("Error loading statistics:", error);
        } finally {
            setLoading(false);
        }
    };

    // Sort students based on selected criteria
    const sortedStats = [...studentStats].sort((a, b) => {
        if (sortBy === "totalVotes") {
            return b.totalVotes - a.totalVotes;
        } else {
            return a.studentName.localeCompare(b.studentName);
        }
    });

    // Get top 5 students
    const topStudents = sortedStats.slice(0, 5);

    // Get statistics summary
    const totalStudents = studentStats.length;
    const totalVotesAll = studentStats.reduce((sum, stats) => sum + stats.totalVotes, 0);
    const avgVotesPerStudent = totalStudents > 0 ? (totalVotesAll / totalStudents).toFixed(1) : "0";

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold mb-4">Đang tải thống kê...</div>
                    <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="border-4 border-black bg-white p-6 mb-8 shadow-[8px_8px_0_0_#000]">
                    <h1 className="text-4xl md:text-5xl font-black text-black mb-2">
                        📊 THỐNG KÊ HỌC SINH
                    </h1>
                    <div className="h-2 w-32 bg-pink-400"></div>
                    <p className="mt-4 text-lg font-bold text-gray-700">
                        Thống kê lượt vote và menu yêu thích của học sinh
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Summary & Filters */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Statistics Summary */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-blue-400"></div>
                                <h2 className="text-2xl font-black text-black">📈 TỔNG QUAN</h2>
                            </div>

                            <div className="space-y-4">
                                <div className="border-2 border-black p-4 bg-gradient-to-r from-blue-50 to-purple-50">
                                    <div className="text-center">
                                        <div className="text-4xl font-black">{totalStudents}</div>
                                        <div className="text-gray-600">Tổng học sinh</div>
                                    </div>
                                </div>

                                <div className="border-2 border-black p-4 bg-gradient-to-r from-green-50 to-blue-50">
                                    <div className="text-center">
                                        <div className="text-4xl font-black">{totalVotesAll}</div>
                                        <div className="text-gray-600">Tổng lượt vote</div>
                                    </div>
                                </div>

                                <div className="border-2 border-black p-4 bg-gradient-to-r from-yellow-50 to-orange-50">
                                    <div className="text-center">
                                        <div className="text-4xl font-black">{avgVotesPerStudent}</div>
                                        <div className="text-gray-600">Vote trung bình/HS</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sort Controls */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-green-400"></div>
                                <h2 className="text-2xl font-black text-black">🔀 SẮP XẾP</h2>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setSortBy("totalVotes")}
                                    className={`w-full text-left p-4 border-2 ${sortBy === "totalVotes" ? 'border-blue-500 bg-blue-50' : 'border-black'} transition-all`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 flex items-center justify-center ${sortBy === "totalVotes" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                            <span className="font-bold">↓</span>
                                        </div>
                                        <div>
                                            <div className="font-bold">Số lượt vote</div>
                                            <div className="text-sm text-gray-600">Nhiều nhất đến ít nhất</div>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSortBy("name")}
                                    className={`w-full text-left p-4 border-2 ${sortBy === "name" ? 'border-blue-500 bg-blue-50' : 'border-black'} transition-all`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 flex items-center justify-center ${sortBy === "name" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                            <span className="font-bold">A-Z</span>
                                        </div>
                                        <div>
                                            <div className="font-bold">Tên học sinh</div>
                                            <div className="text-sm text-gray-600">Theo thứ tự alphabet</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Top 5 Students */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-yellow-400"></div>
                                <h2 className="text-2xl font-black text-black">{sortBy == "totalVotes" ? "🏆 TOP 5" : "Theo thứ tự alphabet"}</h2>
                            </div>

                            <div className="space-y-3">
                                {topStudents.map((student, index) => (
                                    <div key={student.studentId} className="border-2 border-black p-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 flex items-center justify-center ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-200'} text-white font-bold`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold">{student.studentName}</div>
                                                <div className="text-sm text-gray-600">{student.studentId}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg">{student.totalVotes}</div>
                                                <div className="text-xs text-gray-600">lượt</div>
                                            </div>
                                        </div>
                                        {student.favoriteMenu.count > 0 && (
                                            <div className="mt-2 text-xs">
                                                <span className="text-gray-600">Thích nhất:</span>
                                                <span className="font-bold ml-1">{student.favoriteMenu.menuName}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Student List */}
                    <div className="lg:col-span-2">
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-8 bg-red-400"></div>
                                    <h2 className="text-2xl font-black text-black">👨‍🎓 DANH SÁCH HỌC SINH</h2>
                                </div>
                                <span className="px-4 py-2 bg-black text-white font-bold">
                                    {studentStats.length} HS
                                </span>
                            </div>

                            {studentStats.length === 0 ? (
                                <div className="border-2 border-dashed border-gray-400 p-12 text-center">
                                    <div className="text-xl font-bold text-gray-500">Chưa có dữ liệu học sinh</div>
                                    <p className="text-gray-600 mt-2">Thêm học sinh và tạo vote để xem thống kê</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                                    {sortedStats.map((student) => (
                                        <div
                                            key={student.studentId}
                                            className={`border-2 ${selectedStudent === student.studentId ? 'border-blue-500' : 'border-black'} p-4 cursor-pointer hover:bg-gray-50 transition-all`}
                                            onClick={() => setSelectedStudent(
                                                selectedStudent === student.studentId ? null : student.studentId
                                            )}
                                        >
                                            {/* Student Header */}
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                                                        {student.studentName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg">{student.studentName}</div>
                                                        <div className="text-sm text-gray-600">{student.studentId}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-600">Tổng vote</div>
                                                    <div className="font-bold text-2xl">{student.totalVotes}</div>
                                                </div>
                                            </div>

                                            {/* Favorite Menu */}
                                            {student.favoriteMenu.count > 0 && (
                                                <div className="mb-3 p-2 bg-gradient-to-r from-green-50 to-blue-50 border border-black">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="font-bold">Menu yêu thích</div>
                                                            <div className="text-sm text-gray-600">{student.favoriteMenu.menuName}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm text-gray-600">Số lần chọn</div>
                                                            <div className="font-bold text-lg">{student.favoriteMenu.count}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Expanded Details */}
                                            {selectedStudent === student.studentId && Object.keys(student.menuVotes).length > 0 && (
                                                <div className="mt-4 border-t-2 border-black pt-4">
                                                    <div className="font-bold mb-3 flex items-center gap-2">
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                                            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                                                        </svg>
                                                        Chi tiết lượt vote theo menu
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {Object.entries(student.menuVotes)
                                                            .sort(([, a], [, b]) => b.count - a.count)
                                                            .map(([menuId, menuData]) => (
                                                                <div key={menuId} className="border border-black p-3">
                                                                    <div className="flex justify-between items-center">
                                                                        <div>
                                                                            <div className="font-bold">{menuData.menuName}</div>
                                                                            <div className="text-xs text-gray-600">ID: {menuId}</div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="font-bold text-xl">{menuData.count}</div>
                                                                            <div className="text-xs text-gray-600">lượt</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="mt-2">
                                                                        <div className="w-full bg-gray-200 h-2">
                                                                            <div
                                                                                className="bg-purple-500 h-2"
                                                                                style={{
                                                                                    width: `${student.totalVotes > 0 ? (menuData.count / student.totalVotes * 100) : 0}%`
                                                                                }}
                                                                            ></div>
                                                                        </div>
                                                                        <div className="text-xs text-gray-600 mt-1 text-right">
                                                                            {student.totalVotes > 0 ?
                                                                                `${((menuData.count / student.totalVotes) * 100).toFixed(1)}%` :
                                                                                '0%'
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>

                                                    {/* Summary */}
                                                    <div className="mt-4 p-3 bg-black text-white">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <div className="font-bold">Tổng kết</div>
                                                                <div className="text-sm text-gray-300">
                                                                    {Object.keys(student.menuVotes).length} menu đã từng vote
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm">Tổng lượt vote</div>
                                                                <div className="font-bold text-xl">{student.totalVotes}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedStudent === student.studentId && Object.keys(student.menuVotes).length === 0 && (
                                                <div className="mt-4 p-4 text-center border-2 border-dashed border-gray-400">
                                                    <div className="text-gray-500">Học sinh chưa tham gia vote nào</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Export Section */}
                        <div className="mt-8 border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-purple-400"></div>
                                <h2 className="text-2xl font-black text-black">💾 XUẤT BÁO CÁO</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => {
                                        const data = sortedStats.map(student => ({
                                            'Mã HS': student.studentId,
                                            'Tên HS': student.studentName,
                                            'Tổng vote': student.totalVotes,
                                            'Menu yêu thích': student.favoriteMenu.menuName,
                                            'Số lần chọn menu yêu thích': student.favoriteMenu.count
                                        }));

                                        let csv = '\ufeffMã HS,Tên HS,Tổng vote,Menu yêu thích,Số lần chọn menu yêu thích\n';
                                        data.forEach(row => {
                                            csv += `${row['Mã HS']},${row['Tên HS']},${row['Tổng vote']},${row['Menu yêu thích']},${row['Số lần chọn menu yêu thích']}\n`;
                                        });

                                        const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
                                        const link = document.createElement('a');
                                        link.href = URL.createObjectURL(blob);
                                        link.download = `thong-ke-hoc-sinh-${new Date().toISOString().split('T')[0]}.csv`;
                                        link.click();
                                    }}
                                    className="border-2 border-black p-4 text-center hover:bg-gray-50 transition-all"
                                >
                                    <div className="text-3xl mb-2">📊</div>
                                    <div className="font-bold">CSV</div>
                                    <div className="text-sm text-gray-600 mt-1">Xuất danh sách</div>
                                </button>

                                <button
                                    onClick={() => window.print()}
                                    className="border-2 border-black p-4 text-center hover:bg-gray-50 transition-all"
                                >
                                    <div className="text-3xl mb-2">🖨️</div>
                                    <div className="font-bold">IN ẤN</div>
                                    <div className="text-sm text-gray-600 mt-1">Báo cáo in trực tiếp</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 border-4 border-black bg-white p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="font-bold text-lg mb-2">📝 Ghi chú</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Chỉ tính các vote đã hoàn thành</li>
                                <li>• Menu yêu thích = được vote nhiều nhất</li>
                                <li>• Click vào học sinh để xem chi tiết</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2">📅 Cập nhật</h3>
                            <p className="text-gray-600">{new Date().toLocaleString('vi-VN')}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2">🎯 Mục tiêu</h3>
                            <p className="text-gray-600">
                                Phân tích sở thích ăn uống
                                <br />
                                Tối ưu hóa menu
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}