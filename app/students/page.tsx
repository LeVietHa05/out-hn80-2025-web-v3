"use client";
import { useState, useEffect } from "react";
import { Student, Vote, FoodQueueItem } from "@/type";

export default function StudentPickupPage() {
    const [studentId, setStudentId] = useState("");
    const [student, setStudent] = useState<Student | null>(null);
    const [todayVotes, setTodayVotes] = useState<Vote[]>([]);
    const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
    const [loading, setLoading] = useState(false);
    const [pickupStatus, setPickupStatus] = useState<{
        loading: boolean;
        success?: boolean;
        message?: string;
        queueItem?: FoodQueueItem;
    }>({ loading: false });
    const [queuePosition, setQueuePosition] = useState<number | null>(null);

    // Get today's date
    const today = new Date().toISOString().split("T")[0];

    // Load today's votes and student info
    useEffect(() => {
        const loadTodayVotes = async () => {
            try {
                const response = await fetch(`/api/votes?date=${today}`);
                const data = await response.json();
                console.log(data)
                setTodayVotes(data.filter((v: Vote) => v.winner)); // Only active votes
            } catch (error) {
                console.error("Error loading votes:", error);
            }
        };
        loadTodayVotes();
    }, [today]);

    const checkStudent = async () => {
        if (!studentId.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/students/${studentId}`);
            const data = await response.json();

            if (response.ok && data.student) {
                setStudent(data.student);
                setSelectedVote(null);
                setPickupStatus({ loading: false });
            } else {
                setStudent(null);
                alert("Student not found!");
            }
        } catch (error) {
            console.error("Error checking student:", error);
            alert("Error checking student ID");
        } finally {
            setLoading(false);
        }
    };

    const requestPickup = async () => {
        if (!student || !selectedVote) return;

        setPickupStatus({ loading: true });
        try {
            const response = await fetch("/api/pickup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: student.studentId,
                    date: selectedVote.date,
                    type: selectedVote.type
                })
            });

            const data = await response.json();

            if (response.ok) {
                setPickupStatus({
                    loading: false,
                    success: true,
                    message: data.message,
                    queueItem: data.queueItem
                });
                setQueuePosition(data.estimatedTime || null);
            } else {
                setPickupStatus({
                    loading: false,
                    success: false,
                    message: data.error || "Failed to request pickup"
                });
            }
        } catch (error) {
            console.error("Error requesting pickup:", error);
            setPickupStatus({
                loading: false,
                success: false,
                message: "Network error"
            });
        }
    };

    // Check queue status periodically
    useEffect(() => {
        if (!pickupStatus.success || !queuePosition) return;

        const interval = setInterval(() => {
            setQueuePosition(prev => prev ? Math.max(0, prev - 1) : null);
        }, 1000); // Update every second

        return () => clearInterval(interval);
    }, [pickupStatus.success, queuePosition]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="border-4 border-black bg-white p-6 mb-8 shadow-[8px_8px_0_0_#000]">
                    <h1 className="text-4xl md:text-5xl font-black text-black mb-2">🍚 MEAL PICKUP SYSTEM</h1>
                    <div className="h-2 w-32 bg-red-400"></div>
                    <p className="mt-4 text-lg font-bold text-gray-700">
                        Get your meal from the automated food dispenser
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Student & Meal Selection */}
                    <div className="space-y-6">
                        {/* Student ID Check */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-blue-400"></div>
                                <h2 className="text-2xl font-black text-black">1.👨‍🎓 STUDENT LOGIN</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block font-bold mb-2 text-lg">Student ID:</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={studentId}
                                            onChange={(e) => setStudentId(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && checkStudent()}
                                            placeholder="Enter your student ID"
                                            className="flex-1 border-2 border-black p-3 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                        <button
                                            onClick={checkStudent}
                                            disabled={loading || !studentId.trim()}
                                            className="px-6 py-3 bg-black text-white font-bold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all border-2 border-black"
                                        >
                                            {loading ? "..." : "CHECK"}
                                        </button>
                                    </div>
                                </div>

                                {/* Student Info */}
                                {student && (
                                    <div className="border-2 border-black p-4 bg-gradient-to-r from-green-100 to-blue-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl">{student.name}</h3>
                                                <p className="text-gray-600">{student.studentId}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Available Meals */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-green-400"></div>
                                <h2 className="text-2xl font-black text-black">2.🍽️ AVAILABLE MEALS</h2>
                            </div>

                            {todayVotes.length === 0 ? (
                                <div className="border-2 border-dashed border-gray-400 p-8 text-center">
                                    <div className="text-lg font-bold text-gray-500">No meals available today</div>
                                    <p className="text-gray-600 mt-2">Check back during meal times</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {todayVotes.map((vote) => {
                                        const winnerMeal = vote.menus.find(menu =>
                                            menu.menuId == vote.winner
                                        );

                                        return (
                                            <div
                                                key={`${vote.date}-${vote.type}`}
                                                className={`border-2 ${selectedVote?.date === vote.date && selectedVote?.type === vote.type ? 'border-blue-500' : 'border-black'} p-4 cursor-pointer hover:bg-gray-50 transition-all`}
                                                onClick={() => student && setSelectedVote(vote)}
                                            >
                                                {/* <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl font-black">{vote.type.toUpperCase()}</span>
                                                        <span className={`px-2 py-1 text-xs font-bold ${vote.type === 'lunch' ? 'bg-yellow-200' : 'bg-purple-200'}`}>
                                                            TODAY
                                                        </span>
                                                    </div>
                                                    {studentVotedMenu ? (
                                                        <span className="px-3 py-1 bg-green-200 text-green-800 text-sm font-bold border border-green-500">
                                                            ✓ VOTED
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-red-200 text-red-800 text-sm font-bold border border-red-500">
                                                            NOT VOTED
                                                        </span>
                                                    )}
                                                </div> */}

                                                {winnerMeal ? (
                                                    <div className="mt-2">
                                                        <div className="font-bold">WINNER Meal:</div>
                                                        <div className="text-lg font-black">{vote.date} - {vote.type} - {winnerMeal.name} </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-2">
                                                        <div className="font-bold">Something Wrong</div>
                                                    </div>
                                                )
                                                }
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Pickup & Status */}
                    <div className="space-y-6">
                        {/* Pickup Request */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-red-400"></div>
                                <h2 className="text-2xl font-black text-black">3.🤖 PICKUP REQUEST</h2>
                            </div>

                            {!student ? (
                                <div className="border-2 border-dashed border-gray-400 p-8 text-center">
                                    <div className="text-lg font-bold text-gray-500">Enter your Student ID first</div>
                                </div>
                            ) : !selectedVote ? (
                                <div className="border-2 border-dashed border-gray-400 p-8 text-center">
                                    <div className="text-lg font-bold text-gray-500">Select a meal to pick up</div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Selected Meal Info */}
                                    <div className="border-2 border-black p-4 bg-yellow-50">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <h3 className="font-bold text-xl">{selectedVote.type.toUpperCase()}</h3>
                                                <p className="text-gray-600">Today&apos;s meal</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-600">Menu</div>
                                                <div className="font-bold text-lg">
                                                    {selectedVote.menus.find(m =>
                                                        m.menuId == selectedVote.winner
                                                    )?.name || "Not found"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pickup Button */}
                                    <div className="text-center">
                                        <button
                                            onClick={requestPickup}
                                            disabled={pickupStatus.loading}
                                            className="w-full py-4 bg-black text-white text-2xl font-bold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all border-4 border-black shadow-[8px_8px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] active:shadow-none"
                                        >
                                            {pickupStatus.loading ? (
                                                "REQUESTING..."
                                            ) : (
                                                <div className="flex items-center justify-center gap-3">
                                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M13 7H7v6h6V7z" />
                                                        <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
                                                    </svg>
                                                    PICK UP MY MEAL
                                                </div>
                                            )}
                                        </button>
                                    </div>

                                    {/* Status Display */}
                                    {pickupStatus.message && (
                                        <div className={`border-2 ${pickupStatus.success ? 'border-green-500' : 'border-red-500'} p-4 ${pickupStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
                                            <div className="flex items-center gap-3">
                                                {pickupStatus.success ? (
                                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-lg">{pickupStatus.message}</div>
                                                    {pickupStatus.queueItem && (
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            Queue ID: {pickupStatus.queueItem.studentId}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Queue Status */}
                        {queuePosition !== null && (
                            <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-3 h-8 bg-purple-400"></div>
                                    <h2 className="text-2xl font-black text-black">⏱️ QUEUE STATUS</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-5xl font-black">{queuePosition}</div>
                                        <div className="text-gray-600">seconds remaining</div>
                                    </div>

                                    <div className="relative pt-2">
                                        <div className="flex mb-2 items-center justify-between">
                                            <div>
                                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-200">
                                                    Progress
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-semibold inline-block">
                                                    {Math.max(0, 60 - queuePosition)}/60s
                                                </span>
                                            </div>
                                        </div>
                                        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-gray-200">
                                            <div
                                                style={{ width: `${Math.min(100, ((30 - queuePosition) / 30) * 100)}%` }}
                                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-300"
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="border-2 border-black p-4 bg-blue-50">
                                        <div className="text-center">
                                            <div className="font-bold">Approaching the machine...</div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Please stand by the food dispenser
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-yellow-400"></div>
                                <h2 className="text-2xl font-black text-black">📋 INSTRUCTIONS</h2>
                            </div>

                            <ol className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white flex items-center justify-center font-bold">1</span>
                                    <span>Enter Student ID and check your identity</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white flex items-center justify-center font-bold">2</span>
                                    <span>Select the meal in 🍽️ AVAILABLE MEALS</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white flex items-center justify-center font-bold">3</span>
                                    <span>Click &quot;PICK UP MY MEAL&quot; to join queue</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white flex items-center justify-center font-bold">4</span>
                                    <span>Wait at the food dispenser for your meal</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white flex items-center justify-center font-bold">5</span>
                                    <span>Collect your meal when dispensed</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 border-4 border-black bg-white p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-lg">Food Dispenser Status</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="font-bold text-green-600">OPERATIONAL</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600">Current Time</div>
                            <div className="font-bold">{new Date().toLocaleTimeString()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
