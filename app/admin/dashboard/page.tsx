"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, MenuVote, Student, Vote } from "@/type";

export default function AdminDashboard() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [votes, setVotes] = useState<Vote[]>([]);
    const [date, setDate] = useState("");
    const [type, setType] = useState("lunch");
    const [tab, setTab] = useState<"menus" | "students" | "votes">("votes");

    // State for expandable sections
    const [expandedStudents, setExpandedStudents] = useState<{ [key: string]: boolean }>({});
    const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

    const loadAll = async () => {
        const [m, s, v] = await Promise.all([
            fetch("/api/menus").then(r => r.json()),
            fetch("/api/students").then(r => r.json()),
            fetch("/api/votes").then(r => r.json())
        ]);
        setMenus(m.menus);
        setStudents(s.students);
        setVotes(v.reverse());
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadAll();
    }, []);

    const openVote = async () => {
        await fetch(`/api/daily-menu?date=${date}&type=${type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, type })
        });
        loadAll();
    };

    const closeVote = async (date: string, type: string) => {
        await fetch(`/api/close-vote?date=${date}&type=${type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, type })
        });
        loadAll();
    };

    const toggleStudentExpanded = (studentId: string) => {
        setExpandedStudents(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const toggleMenuExpanded = (studentId: string, menuKey: string) => {
        const key = `${studentId}-${menuKey}`;
        setExpandedMenus(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Data Inspector render function
    const renderDataInspector = () => {
        const data = tab === "votes" ? votes : tab === "menus" ? menus : students;

        if (tab === "votes") {
            return (
                <div className="space-y-4">
                    {(data as Vote[]).map((vote, idx) => (
                        <div key={idx} className="border-2 border-black p-3 bg-white">
                            <div className="flex justify-center items-start flex-col mb-3 gap-2">
                                <span>
                                    <div className="font-bold text-lg">{vote.date}</div>
                                    <span className={` px-3 py-1 ${vote.type === 'lunch' ? 'bg-yellow-200' : 'bg-purple-200'} border border-black`}>
                                        {vote.type.toUpperCase()}
                                    </span>

                                    <span className={`px-3 py-1 ${vote.winner ? 'bg-gray-200' : 'bg-red-200'} border border-black`}>
                                        {vote.winner ? 'Closed' : 'Active'}
                                    </span>
                                </span>
                                {vote.winner && (
                                    <span className=" px-3 py-1 bg-green-200 border border-black">
                                        Winner: {vote.winner}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {vote.menus.map((menu, mIdx) => (
                                    <div key={mIdx} className={`border border-gray-400 p-3 ${menu.menuId == vote.winner ? 'bg-green-200' : ""}`}>
                                        <div className="font-semibold mb-2">{menu.name}</div>
                                        <div className="text-sm">
                                            <div className="flex justify-between">
                                                <span>Votes:</span>
                                                <span className="font-bold">{menu.votedStudentIds.length}</span>
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-gray-600">Voters:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {menu.votedStudentIds.map((id, i) => (
                                                        <span key={i} className="text-xs">
                                                            {id}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {vote.totalRaw && (
                                <div className="mt-3 p-3 bg-gray-50 border border-black">
                                    <div className="font-semibold mb-2">Total Raw:</div>
                                    <pre className="text-xs overflow-x-auto">
                                        {JSON.stringify(vote.totalRaw, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        if (tab === "menus") {
            return (
                <div className="space-y-4">
                    {(data as Menu[]).map((menu, idx) => (
                        <div key={idx} className="border-2 border-black p-4 bg-white">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-lg">{menu.name}</span>
                                <span className="px-3 py-1 bg-black text-white text-sm">
                                    ID: {menu.menuId}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                {menu.items.map((item, iIdx) => (
                                    <div key={iIdx} className="flex items-center justify-between border border-gray-400 p-2 gap-2">
                                        <div className="flex-6 font-semibold">{item.name}</div>
                                        <div className="flex-3 ">
                                            <span className="px-2 py-1 bg-gray-200 border border-black text-xs">
                                                {item.category}
                                            </span>
                                        </div>
                                        <div className="flex-3 text-xs text-gray-600">ID: {item.itemId}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {(data as Student[]).map((student, idx) => {
                    const studentId = student.studentId;
                    const isStudentExpanded = expandedStudents[studentId];
                    const menuKeys = student.menuConfigs ? Object.keys(student.menuConfigs) : [];

                    return (
                        <div key={idx} className="border-2 border-black bg-white">
                            {/* Student Header - Clickable */}
                            <button
                                onClick={() => toggleStudentExpanded(studentId)}
                                className="w-full text-left p-2 hover:bg-gray-50 transition-all"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3 flex-8">
                                        <div className="flex-2">
                                            {isStudentExpanded ? (
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10L12 15L17 10" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 7L15 12L10 17" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                                            )}
                                        </div>
                                        <div className="flex-9">
                                            <span className=" py-1 font-light text-xs">
                                                {studentId}
                                            </span>
                                            <div className="font-bold text-lg ">{student.name}</div>
                                        </div>
                                    </div>
                                    <div className="text-right flex-4">
                                        <span className="text-sm text-gray-600">Menus: </span>
                                        <span className="font-bold">{menuKeys.length}</span>
                                    </div>
                                </div>
                            </button>

                            {/* Student Details - Expandable */}
                            {isStudentExpanded && menuKeys.length > 0 && (
                                <div className="border-t-2 border-black p-4 bg-gray-50">
                                    <div className="mb-4">
                                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                            <span>🍽️ Menu Configurations</span>
                                            <span className="px-2 py-1 bg-black text-white text-sm">
                                                {menuKeys.length} menus
                                            </span>
                                        </h4>
                                    </div>

                                    <div className="space-y-3">
                                        {menuKeys.map((menuKey) => {
                                            const foods = student.menuConfigs[menuKey];
                                            const expandedKey = `${studentId}-${menuKey}`;
                                            const isMenuExpanded = expandedMenus[expandedKey];
                                            const foodKeys = Object.keys(foods);

                                            return (
                                                <div key={menuKey} className="border border-black bg-white">
                                                    {/* Menu Header */}
                                                    <button
                                                        onClick={() => toggleMenuExpanded(studentId, menuKey)}
                                                        className="w-full text-left p-3 hover:bg-gray-100 border-b border-black flex justify-between items-center"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {isMenuExpanded ? (
                                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7 10L12 15L17 10" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                                                            ) : (
                                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10 7L15 12L10 17" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                                                            )}
                                                            <span className="font-light text-xs">{menuKey}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm text-gray-600">
                                                                {foodKeys.length} items
                                                            </span>
                                                            <span className="px-2 py-1 bg-green-200 text-xs border border-black">
                                                                {foodKeys.length > 0 ? "Configured" : "Empty"}
                                                            </span>
                                                        </div>
                                                    </button>

                                                    {/* Food Items - Expandable */}
                                                    {isMenuExpanded && foodKeys.length > 0 && (
                                                        <div className="p-3 bg-white">
                                                            <div className="grid grid-cols-1  gap-3">
                                                                {Object.entries(foods).map(([foodKey, config], foodIdx) => (
                                                                    <div
                                                                        key={foodIdx}
                                                                        className="border-2 border-gray-300 p-3 bg-white hover:bg-blue-50 transition-colors"
                                                                    >
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="text-xs text-gray-500">Food ID</div>
                                                                                <div className="font-bold text-sm border-2 p-2">{foodKey}</div>
                                                                            </div>
                                                                            {/* <div className="text-right">
                                                                                <div className="flex items-center gap-1">
                                                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                                    <span className="text-xs font-bold">ACTIVE</span>
                                                                                </div>
                                                                            </div> */}
                                                                        </div>

                                                                        <div className="space-y-2 mt-3">
                                                                            <div className="flex justify-between items-center bg-gray-100 px-2 border border-black">
                                                                                <span className="text-sm font-semibold">Weight</span>
                                                                                <span className="font-bold text-lg">{config.rawWeight}<span className="text-sm">g</span></span>
                                                                            </div>

                                                                            <div className="flex justify-between items-center bg-yellow-100 px-2 border border-black">
                                                                                <span className="text-sm font-semibold">Calories</span>
                                                                                <span className="font-bold text-lg">{config.calo}<span className="text-sm">cal</span></span>
                                                                            </div>
                                                                        </div>

                                                                        {/* <div className="mt-3 pt-2 border-t border-gray-300">
                                                                            <div className="flex justify-between text-xs">
                                                                                <span className="text-gray-500">Total Energy:</span>
                                                                                <span className="font-bold">
                                                                                    {(config.rawWeight * 0.1 + config.calo).toFixed(1)} units
                                                                                </span>
                                                                            </div>
                                                                        </div> */}
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Menu Summary */}
                                                            <div className="mt-4 p-3 bg-black text-white">
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <span className="font-bold">Menu Summary:</span>
                                                                        <span className="ml-2 text-sm text-gray-300">{menuKey}</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-sm">Total Items: {foodKeys.length}</div>
                                                                        <div className="text-xs text-gray-300">
                                                                            Avg Weight: {Math.round(
                                                                                Object.values(foods).reduce((sum, f) => sum + f.rawWeight, 0) / foodKeys.length
                                                                            )}g
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {isMenuExpanded && foodKeys.length === 0 && (
                                                        <div className="p-4 text-center border-t border-dashed border-gray-400">
                                                            <div className="text-gray-500">No food items configured for this menu</div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Student Summary */}
                                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-black">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h5 className="font-bold text-lg">Student Summary</h5>
                                                <p className="text-sm text-gray-600">{student.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm">Total Menus: {menuKeys.length}</div>
                                                <div className="text-sm">
                                                    Total Foods: {Object.values(student.menuConfigs).reduce(
                                                        (total, foods) => total + Object.keys(foods).length, 0
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isStudentExpanded && menuKeys.length === 0 && (
                                <div className="border-t-2 border-black p-6 text-center bg-yellow-50">
                                    <div className="text-lg font-bold text-gray-600 mb-2">⚠️ No Menu Configurations</div>
                                    <p className="text-gray-500 mb-4">This student hasn&rsquo;t configured any menu preferences yet.</p>
                                    <button className="px-4 py-2 bg-black text-white text-sm font-bold border-2 border-black hover:bg-gray-800">
                                        ADD DEFAULT CONFIGS
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-pink-50 p-4 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto">
                <div className="border-4 border-black bg-white p-6 mb-8 shadow-[8px_8px_0_0_#000]">
                    <h1 className="text-4xl md:text-5xl font-black text-black mb-2">ADMIN DASHBOARD</h1>
                    <div className="h-2 w-32 bg-pink-400"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Overview & Open Vote */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Overview Section */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-yellow-400"></div>
                                <h2 className="text-2xl font-black text-black">📊 OVERVIEW</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="border-2 border-black p-4 bg-blue-50">
                                    <div className="text-lg font-bold mb-2">🍱 Menus</div>
                                    <div className="text-3xl font-black mb-3">{menus.length}</div>
                                    <Link
                                        href="/menus"
                                        className="inline-block px-4 py-2 bg-black text-white font-bold hover:bg-gray-800 transition-all border-2 border-black"
                                    >
                                        ADD MORE
                                    </Link>
                                </div>

                                <div className="border-2 border-black p-4 bg-green-50">
                                    <div className="text-lg font-bold mb-2">👨‍🎓 Students</div>
                                    <div className="text-3xl font-black mb-3">{students.length}</div>
                                    <Link
                                        href="/students"
                                        className="inline-block px-4 py-2 bg-black text-white font-bold hover:bg-gray-800 transition-all border-2 border-black"
                                    >
                                        ADD MORE
                                    </Link>
                                </div>

                                <div className="border-2 border-black p-4 bg-red-50">
                                    <div className="text-lg font-bold mb-2">🗳 Active Votes</div>
                                    <div className="text-3xl font-black">
                                        {votes.filter(v => !v.winner).length}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Votes Section */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-red-400"></div>
                                <h2 className="text-2xl font-black text-black">🔥 ACTIVE VOTES</h2>
                            </div>

                            <div className="space-y-4">
                                {votes.filter(v => !v.winner).length === 0 ? (
                                    <div className="border-2 border-dashed border-gray-400 p-8 text-center">
                                        <div className="text-xl font-bold text-gray-500">No active votes</div>
                                    </div>
                                ) : (
                                    votes.filter(v => !v.winner).map(v => (
                                        <div key={v.date + v.type} className="border-2 border-black p-4 bg-yellow-50">
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <span className="text-xl font-black">{v.date}</span>
                                                    <span className={`ml-3 px-4 py-1 ${v.type === 'lunch' ? 'bg-yellow-400' : 'bg-purple-400'} border-2 border-black font-bold`}>
                                                        {v.type.toUpperCase()}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => closeVote(v.date, v.type)}
                                                    className="px-4 py-2 bg-red-500 text-white font-bold hover:bg-red-600 transition-all border-2 border-black"
                                                >
                                                    CLOSE VOTE
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {v.menus.map((m: MenuVote) => (
                                                    <div key={m.menuId} className="border border-black p-3 bg-white">
                                                        <div className="font-bold mb-2">{m.name}</div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm">Votes:</span>
                                                            <span className="text-xl font-black">{m.votedStudentIds.length}</span>
                                                        </div>
                                                        <div className="mt-2 text-xs text-gray-600">
                                                            ID: {m.menuId}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Open Vote Section */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-green-400"></div>
                                <h2 className="text-2xl font-black text-black">🚀 OPEN VOTE</h2>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <input
                                    type="date"
                                    onChange={e => setDate(e.target.value)}
                                    className="flex-1 border-2 border-black p-3 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />

                                <select
                                    onChange={e => setType(e.target.value)}
                                    className="border-2 border-black p-3 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="lunch">🍽️ LUNCH</option>
                                    <option value="dinner">🌙 DINNER</option>
                                </select>

                                <button
                                    onClick={openVote}
                                    className="px-8 py-3 bg-black text-white font-bold hover:bg-gray-800 transition-all border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] active:shadow-none"
                                >
                                    OPEN VOTE
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Data Inspector */}
                    <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] h-fit">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-3 h-8 bg-blue-400"></div>
                            <h2 className="text-2xl font-black text-black">🔍 DATA INSPECTOR</h2>
                        </div>

                        {/* Tab Selector */}
                        <div className="flex border-2 border-black mb-6">
                            <button
                                onClick={() => setTab("votes")}
                                className={`flex-1 py-3 font-bold border-r-2 border-black ${tab === "votes" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-300"
                                    }`}
                            >
                                VOTES
                            </button>
                            <button
                                onClick={() => setTab("menus")}
                                className={`flex-1 py-3 font-bold border-r-2 border-black ${tab === "menus" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-300"
                                    }`}
                            >
                                MENUS
                            </button>
                            <button
                                onClick={() => setTab("students")}
                                className={`flex-1 py-3 font-bold ${tab === "students" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-300"
                                    }`}
                            >
                                STUDENTS
                            </button>
                        </div>

                        {/* Data Display */}
                        <div className="border-2 border-black p-4 bg-gray-50 min-h-[400px] max-h-[600px] overflow-y-auto">
                            {renderDataInspector()}
                        </div>

                        {/* Data Summary */}
                        <div className="mt-4 p-3 bg-black text-white">
                            <div className="flex justify-between">
                                <span className="font-bold">Total Items:</span>
                                <span className="font-bold">
                                    {tab === "votes" ? votes.length :
                                        tab === "menus" ? menus.length :
                                            students.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}