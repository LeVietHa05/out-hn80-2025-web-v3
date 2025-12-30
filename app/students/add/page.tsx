"use client";
import { useEffect, useState } from "react";
import { Menu, MenuItem, StudentMenuConfig } from "@/type";

export default function StudentPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [name, setName] = useState("");
    const [studentId, setStudentId] = useState("");
    const [menuConfigs, setMenuConfigs] = useState<StudentMenuConfig>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch("/api/menus")
            .then((res) => res.json())
            .then((data) => setMenus(data.menus));
    }, []);

    const submit = async () => {
        if (!studentId.trim() || !name.trim()) {
            alert("Vui lòng nhập đầy đủ thông tin học sinh");
            return;
        }

        setSubmitting(true);
        try {
            const student = {
                studentId,
                name,
                menuConfigs,
            };

            const response = await fetch("/api/students", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(student),
            });

            if (response.ok) {
                alert("✅ Đã lưu học sinh thành công!");
                // Reset form
                setName("");
                setStudentId("");
                setMenuConfigs({});
            } else {
                alert("❌ Lỗi khi lưu học sinh");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("❌ Có lỗi xảy ra");
        } finally {
            setSubmitting(false);
        }
    };

    const updateConfig = (menuId: string, itemId: string, field: string, value: number) => {
        setMenuConfigs((prev: StudentMenuConfig) => ({
            ...prev,
            [menuId]: {
                ...prev[menuId],
                [itemId]: {
                    ...prev?.[menuId]?.[itemId],
                    [field]: value,
                },
            },
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="border-4 border-black bg-white p-6 mb-8 shadow-[8px_8px_0_0_#000]">
                    <h1 className="text-4xl md:text-5xl font-black text-black mb-2">
                        🎓 THÊM HỌC SINH MỚI
                    </h1>
                    <div className="h-2 w-32 bg-purple-400"></div>
                    <p className="mt-4 text-lg font-bold text-gray-700">
                        Thêm học sinh và cấu hình khẩu phần ăn cho từng menu
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Student Info */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Student Information */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-8 bg-blue-400"></div>
                                <h2 className="text-2xl font-black text-black">👤 THÔNG TIN HỌC SINH</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block font-bold mb-2 text-lg">
                                        <span className="text-red-500">*</span> Mã Học Sinh
                                    </label>
                                    <input
                                        type="text"
                                        value={studentId}
                                        onChange={(e) => setStudentId(e.target.value)}
                                        placeholder="VD: HN2024001"
                                        className="w-full border-2 border-black p-3 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold mb-2 text-lg">
                                        <span className="text-red-500">*</span> Họ và Tên
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="VD: Nguyễn Văn A"
                                        className="w-full border-2 border-black p-3 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <div className="border-2 border-black p-4 bg-yellow-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-bold">Lưu ý:</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Mã học sinh phải là duy nhất. Sau khi tạo, học sinh có thể thay đổi cấu hình khẩu phần ăn bất kỳ lúc nào.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <button
                                onClick={submit}
                                disabled={submitting || !studentId.trim() || !name.trim()}
                                className="w-full py-4 bg-black text-white text-2xl font-bold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all border-4 border-black shadow-[8px_8px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] active:shadow-none"
                            >
                                {submitting ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ĐANG LƯU...
                                    </div>
                                ) : (
                                    "💾 LƯU HỌC SINH"
                                )}
                            </button>

                            <div className="mt-4 text-center text-sm text-gray-600">
                                {Object.keys(menuConfigs).length > 0 ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Đã cấu hình {Object.keys(menuConfigs).length} menu
                                    </div>
                                ) : (
                                    <div className="text-gray-500">
                                        Chưa cấu hình menu nào
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Menu Configurations */}
                    <div className="lg:col-span-2">
                        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-8 bg-green-400"></div>
                                    <h2 className="text-2xl font-black text-black">🍽️ CẤU HÌNH KHẨU PHẦN</h2>
                                </div>
                                <span className="px-4 py-2 bg-black text-white font-bold">
                                    {menus.length} MENU
                                </span>
                            </div>

                            {menus.length === 0 ? (
                                <div className="border-2 border-dashed border-gray-400 p-12 text-center">
                                    <div className="text-xl font-bold text-gray-500">Đang tải menu...</div>
                                </div>
                            ) : (
                                <div className="space-y-6 max-h-[650px] overflow-y-auto pr-2">
                                    {menus.map((menu: Menu) => (
                                        <div key={menu.menuId} className="border-2 border-black p-4 bg-gray-50">
                                            {/* Menu Header */}
                                            <div className="flex justify-between items-center mb-4 p-3 bg-white border-2 border-black">
                                                <div>
                                                    <h3 className="font-bold text-xl">{menu.name}</h3>
                                                    <div className="text-sm text-gray-600">ID: {menu.menuId}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-600">Số món</div>
                                                    <div className="font-bold text-lg">{menu.items.length}</div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="space-y-4">
                                                {menu.items.map((item: MenuItem) => {
                                                    const currentConfig = menuConfigs?.[menu.menuId]?.[item.itemId];
                                                    const hasConfig = currentConfig?.rawWeight && currentConfig?.calo;

                                                    return (
                                                        <div key={item.itemId} className={`border-2 ${hasConfig ? 'border-green-500' : 'border-gray-400'} p-3 bg-white`}>
                                                            <div className="flex justify-between items-center mb-3">
                                                                <div>
                                                                    <span className="font-bold text-lg">{item.name}</span>
                                                                    <span className="flex items-center gap-2 mt-1">
                                                                        <span className="px-2 py-1 bg-gray-100 border border-gray-400 text-xs">
                                                                            {item.category}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500">ID: {item.itemId}</span>
                                                                    </span>
                                                                </div>
                                                                {hasConfig && (
                                                                    <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold border border-green-500">
                                                                        ✓ Đã cấu hình
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Configuration Inputs */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="border border-black p-3">
                                                                    <label className="block font-bold mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                            </svg>
                                                                            Khối lượng (gram)
                                                                        </div>
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="1000"
                                                                        placeholder="VD: 150"
                                                                        defaultValue={currentConfig?.rawWeight || ""}
                                                                        onChange={(e) => updateConfig(menu.menuId, item.itemId, "rawWeight", Number(e.target.value))}
                                                                        className="w-full border-2 border-black p-2 font-bold text-center bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                                    />
                                                                    <div className="text-xs text-gray-500 mt-1 text-center">0 - 1000g</div>
                                                                </div>

                                                                <div className="border border-black p-3">
                                                                    <label className="block font-bold mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                                                            </svg>
                                                                            Calo (kcal)
                                                                        </div>
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="2000"
                                                                        placeholder="VD: 200"
                                                                        defaultValue={currentConfig?.calo || ""}
                                                                        onChange={(e) => updateConfig(menu.menuId, item.itemId, "calo", Number(e.target.value))}
                                                                        className="w-full border-2 border-black p-2 font-bold text-center bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                                                                    />
                                                                    <div className="text-xs text-gray-500 mt-1 text-center">0 - 2000 kcal</div>
                                                                </div>
                                                            </div>

                                                            {/* Current Values */}
                                                            {hasConfig && (
                                                                <div className="mt-3 p-2 bg-gray-100 border border-gray-400">
                                                                    <div className="flex justify-between text-sm">
                                                                        <span>Khối lượng:</span>
                                                                        <span className="font-bold">{currentConfig.rawWeight}g</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-sm">
                                                                        <span>Calo:</span>
                                                                        <span className="font-bold">{currentConfig.calo} kcal</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Menu Summary */}
                                            <div className="mt-4 p-3 bg-black text-white">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold">Menu Summary</span>
                                                    <span className="text-sm">
                                                        {menu.items.filter(item =>
                                                            menuConfigs?.[menu.menuId]?.[item.itemId]
                                                        ).length} / {menu.items.length} món đã cấu hình
                                                    </span>
                                                </div>
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
                            <h3 className="font-bold text-lg">Hướng dẫn</h3>
                            <p className="text-gray-600 text-sm">
                                Cấu hình khẩu phần ăn cho từng món trong menu. Học sinh có thể thay đổi sau.
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-600">Tổng menu</div>
                            <div className="font-bold text-lg">{menus.length}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}