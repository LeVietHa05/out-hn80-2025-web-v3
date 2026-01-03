"use client";
import { useState, useEffect } from "react";
import { Vote, MenuVote, Student } from "@/type";

export default function StudentVotingPage() {
    const [studentId, setStudentId] = useState("");
    const [student, setStudent] = useState<Student | null>(null);
    const [activeVotes, setActiveVotes] = useState<Vote[]>([]);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
    const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
    const [voting, setVoting] = useState(false);
    const [voteHistory, setVoteHistory] = useState<Vote[]>([]);

    // Load active votes and vote history
    useEffect(() => {
        const loadVotes = async () => {
            setLoading(true);
            try {
                const [activeRes, historyRes] = await Promise.all([
                    fetch("/api/votes?status=active").then(r => r.json()),
                    fetch("/api/votes?status=closed").then(r => r.json())
                ]);
                console.log(activeRes)
                setActiveVotes(activeRes);
                setVoteHistory(historyRes);
            } catch (error) {
                console.error("Failed to load votes:", error);
            } finally {
                setLoading(false);
            }
        };
        loadVotes();
    }, []);

    // Check student ID
    const checkStudentId = async () => {
        if (!studentId.trim()) return;

        setChecking(true);
        try {
            const response = await fetch(`/api/students/${studentId}`);
            const data = await response.json();
            console.log(data)
            if (response.ok && data.student) {
                setStudent(data.student);
                // Clear any previous selections
                setSelectedVote(null);
                setSelectedMenuId(null);
            } else {
                setStudent(null);
                alert("Student not found!");
            }
        } catch (error) {
            console.error("Error checking student:", error);
            alert("Error checking student ID");
        } finally {
            setChecking(false);
        }
    };

    // Handle vote submission
    const submitVote = async () => {
        if (!student || !selectedVote || !selectedMenuId) return;

        setVoting(true);

        try {
            const response = await fetch(`/api/votes?date=${selectedVote.date}&type=${selectedVote.type}&menuId=${selectedMenuId}&studentId=${student.studentId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: student.studentId,
                    date: selectedVote.date,
                    type: selectedVote.type,
                    menuId: selectedMenuId
                })
            });

            if (response.ok) {
                // Refresh votes after successful vote
                const [activeRes, historyRes] = await Promise.all([
                    fetch("/api/votes?status=active").then(r => r.json()),
                    fetch("/api/votes?status=closed").then(r => r.json())
                ]);
                setActiveVotes(activeRes);
                setVoteHistory(historyRes);

                // Reset selections
                setSelectedVote(null);
                setSelectedMenuId(null);

                alert("Vote submitted successfully!");
            } else {
                alert("Failed to submit vote. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting vote:", error);
            alert("Error submitting vote");
        } finally {
            setVoting(false);
        }
    };

    // Check if student has already voted in a particular vote
    const hasStudentVoted = (vote: Vote) => {
        if (!student) return false;

        return vote.menus.some(menu =>
            menu.votedStudentIds.includes(student.studentId)
        );
    };

    // Get student's vote in a particular vote
    const getStudentVote = (vote: Vote) => {
        if (!student) return null;

        const votedMenu = vote.menus.find(menu =>
            menu.votedStudentIds.includes(student.studentId)
        );

        return votedMenu ? votedMenu.menuId : null;
    };

    // Handle Enter key press for student ID input
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            checkStudentId();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="border-4 border-black bg-white p-6 mb-8 shadow-[8px_8px_0_0_#000]">
                    <h1 className="text-4xl md:text-5xl font-black text-black mb-2">🎯 BÌNH CHỌN CHO MÓN BẠN THÍCH</h1>
                    <div className="h-2 w-32 bg-blue-400"></div>
                    <p className="mt-4 text-lg font-bold text-gray-700">
                        Lắng nghe con tim và báo cáo cân nặng để chón món nhé!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Student ID & Info */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Student ID Check */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-blue-400"></div>
                                <h2 className="text-2xl font-black text-black">👨‍🎓 Đăng nhập</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block font-bold mb-2 text-lg">Nhập mã học sinh:</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={studentId}
                                            onChange={(e) => setStudentId(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="VD: HNeighty123145"
                                            className="flex-1 border-2 border-black p-3 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                        <button
                                            onClick={checkStudentId}
                                            disabled={checking || !studentId.trim()}
                                            className="px-6 py-3 bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] active:shadow-none"
                                        >
                                            {checking ? "Đang tìm..." : "Tìm"}
                                        </button>
                                    </div>
                                </div>

                                {/* Student Info Display */}
                                {student && (
                                    <div className="border-2 border-black p-4 bg-gradient-to-r from-green-100 to-blue-100 mt-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl">{student.name}</h3>
                                                <p className="text-gray-600">{student.studentId}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-3">
                                            <div className="bg-white border border-black p-2 text-center">
                                                <div className="text-sm text-gray-600">Số Menu</div>
                                                <div className="font-bold">
                                                    {Object.keys(student.menuConfigs || {}).length}
                                                </div>
                                            </div>
                                            <div className="bg-white border border-black p-2 text-center">
                                                <div className="text-sm text-gray-600">Số vote khả dụng</div>
                                                <div className="font-bold text-green-600">
                                                    {activeVotes.filter(v => !hasStudentVoted(v)).length}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!student && studentId && (
                                    <div className="border-2 border-red-300 bg-red-50 p-4 mt-4">
                                        <div className="flex items-center gap-2 text-red-600">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                            <span className="font-bold">Không tìm thấy</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Bấm lại nút tìm xem...
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Voting Instructions */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-yellow-400"></div>
                                <h2 className="text-2xl font-black text-black">📝 Cách bình chọn</h2>
                            </div>

                            <ol className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white flex items-center justify-center font-bold">1</span>
                                    <span className="font-semibold">Nhập mã học sinh và tìm (đăng nhập)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white flex items-center justify-center font-bold">2</span>
                                    <span className="font-semibold">Lựa chọn một bình chọn trong danh sách</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white flex items-center justify-center font-bold">3</span>
                                    <span className="font-semibold">Chọn danh sách món ưa thích</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white flex items-center justify-center font-bold">4</span>
                                    <span className="font-semibold">Bấm BÌNH CHỌN</span>
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* Middle Column - Active Votes */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Active Votes Section */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-8 bg-green-400"></div>
                                    <h2 className="text-2xl font-black text-black">🔥 Danh sách bình chọn khả dụng</h2>
                                </div>
                                <span className="px-4 py-2 bg-black text-white font-bold">
                                    {loading ? "ĐANG TẢI..." : `${activeVotes.length} KHẢ DỤNG`}
                                </span>
                            </div>

                            {loading ? (
                                <div className="border-2 border-dashed border-gray-400 p-12 text-center">
                                    <div className="text-xl font-bold text-gray-500">ĐANG TẢI...</div>
                                </div>
                            ) : activeVotes.length === 0 ? (
                                <div className="border-2 border-dashed border-gray-400 p-12 text-center">
                                    <div className="text-xl font-bold text-gray-500">Không có bình chọn khả dụng hiện tại</div>
                                    <p className="text-gray-600 mt-2">Chờ Quản lý mở bình chọn nhé.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeVotes.map((vote) => {
                                        const hasVoted = hasStudentVoted(vote);
                                        const studentVote = getStudentVote(vote);
                                        const isSelected = selectedVote?.date === vote.date && selectedVote?.type === vote.type;

                                        return (
                                            <div
                                                key={`${vote.date}-${vote.type}`}
                                                className={`border-2 ${isSelected ? 'border-blue-500 border-4' : 'border-black'} p-4 bg-white cursor-pointer hover:bg-gray-50 transition-all`}
                                                onClick={() => {
                                                    if (student && !hasVoted) {
                                                        setSelectedVote(vote);
                                                        setSelectedMenuId(null);
                                                    }
                                                }}
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <div>
                                                        <span className="text-xl font-black">{vote.date}</span>
                                                        <span className={`ml-3 px-4 py-1 ${vote.type === 'lunch' ? 'bg-yellow-400' : 'bg-purple-400'} border-2 border-black font-bold`}>
                                                            {vote.type.toUpperCase()}
                                                        </span>
                                                        {hasVoted && student && (
                                                            <span className="ml-3 px-3 py-1 bg-green-200 border border-black font-bold">
                                                                ✓ Đã bình chọn
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-600">Tổng bình chọn</div>
                                                        <div className="font-bold text-lg">
                                                            {vote.menus.reduce((sum, menu) => sum + menu.votedStudentIds.length, 0)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {student && !hasVoted && isSelected && (
                                                    <div className="mt-4 border-t-2 border-black pt-4">
                                                        <h3 className="font-bold text-lg mb-3">Chọn Menu:</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {vote.menus.map((menu) => (
                                                                <button
                                                                    key={menu.menuId}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedMenuId(menu.menuId);
                                                                    }}
                                                                    className={`border-2 ${selectedMenuId === menu.menuId ? 'border-blue-500 bg-blue-50' : 'border-black'} p-4 text-left bg-white hover:bg-gray-100 transition-all`}
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <div className="font-bold text-lg">{menu.name}</div>
                                                                            {/* <div className="text-sm text-gray-600 mt-1">ID: {menu.menuId}</div> */}
                                                                            {menu.items && menu.items.length > 0 && (
                                                                                <div className="mt-2">
                                                                                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                                                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                                            <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293a1 1 0 00-1.414 0l-1 1a1 1 0 000 1.414l4 4a1 1 0 001.414 0l1-1a1 1 0 000-1.414l-4-4z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                        <span className="font-semibold">Món:</span>
                                                                                    </div>
                                                                                    <div className="flex flex-wrap gap-1">
                                                                                        {menu.items.map((item, idx) => (
                                                                                            <span
                                                                                                key={idx}
                                                                                                className="px-2 py-1 text-xs font-medium bg-white border border-black hover:bg-gray-50"
                                                                                                title={`${item.name} (${item.category})`}
                                                                                            >
                                                                                                {item.name}
                                                                                            </span>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {selectedMenuId === menu.menuId && (
                                                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="mt-3 flex justify-between items-center">
                                                                        <span className="text-sm">Bình chọn hiện tại:</span>
                                                                        <span className="font-bold text-lg">{menu.votedStudentIds.length}</span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {selectedMenuId && (
                                                            <div className="mt-6 p-4 bg-black text-white">
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <div className="font-bold">Sẵn sàng bình chọn chưa?</div>
                                                                        <div className="text-sm text-gray-300">
                                                                            {vote.date} - {vote.type}
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={submitVote}
                                                                        disabled={voting}
                                                                        className="px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all border-2 border-white"
                                                                    >
                                                                        {voting ? "Đang bình chọn..." : "BÌNH CHỌN"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Menu Vote Stats */}
                                                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {vote.menus.map((menu) => (
                                                        <div
                                                            key={menu.menuId}
                                                            className={`border ${hasVoted && studentVote === menu.menuId ? 'border-green-500 bg-green-50' : 'border-gray-400'} p-2`}
                                                        >
                                                            <div className="text-sm font-semibold truncate">{menu.name}</div>
                                                            <div className="flex justify-between items-center mt-1">
                                                                <span className="text-xs text-gray-600">Bình chọn:</span>
                                                                <span className="font-bold">{menu.votedStudentIds.length}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Vote History */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-purple-400"></div>
                                <h2 className="text-2xl font-black text-black">📜 Lịch sử bình chọn</h2>
                            </div>

                            {voteHistory.length === 0 ? (
                                <div className="border-2 border-dashed border-gray-400 p-8 text-center">
                                    <div className="text-gray-500">Chưa có</div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {voteHistory.slice(0, 5).map((vote) => (
                                        <div key={`${vote.date}-${vote.type}`} className="border border-black p-3">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="font-bold">{vote.date}</span>
                                                    <span className={`ml-2 px-2 py-1 ${vote.type === 'lunch' ? 'bg-yellow-200' : 'bg-purple-200'} text-sm`}>
                                                        {vote.type}
                                                    </span>
                                                    {vote.winner && (
                                                        <span className="ml-2 px-2 py-1 bg-green-200 text-sm">
                                                            🏆 {vote.winner}
                                                        </span>
                                                    )}
                                                </div>
                                                {student && hasStudentVoted(vote) && (
                                                    <span className="text-sm text-green-600 font-bold"> Bạn bình chọn rồi</span>
                                                )}
                                                {student && !hasStudentVoted(vote) && (
                                                    <span className="text-sm text-red-600 font-bold"> Bạn không tham gia</span>
                                                )}
                                            </div>
                                            <div className="mt-2 text-sm text-gray-600">
                                                Tổng bình chọn: {vote.menus.reduce((sum, menu) => sum + menu.votedStudentIds.length, 0)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 border-4 border-black bg-white p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">Cần trợ giúp?</h3>
                            <p className="text-gray-600">Liên hệ quản lý hoặc thầy cô phụ trách.</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600">Tổng số học sinh: {voteHistory.reduce((total, vote) =>
                                vote.menus.reduce((sum, menu) => sum + menu.votedStudentIds.length, 0), 0
                            )}</div>
                            <div className="font-bold">Cứ từ từ vote nhé ! 🗳️</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}