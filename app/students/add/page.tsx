"use client";

import { useEffect, useState } from "react";
import { Menu, MenuItem } from "@/type";

export default function StudentPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [name, setName] = useState("");
    const [studentId, setStudentId] = useState("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [menuConfigs, setMenuConfigs] = useState<any>({});

    useEffect(() => {
        fetch("/api/menus")
            .then((res) => res.json())
            .then((data) => setMenus(data.menus));
    }, []);

    const submit = async () => {
        const student = {
            studentId,
            name,
            menuConfigs,
        };

        await fetch("/api/students", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(student),
        });

        alert("Đã lưu học sinh");
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Thêm học sinh</h2>

            <input placeholder="Mã HS" onChange={(e) => setStudentId(e.target.value)} />
            <input placeholder="Tên HS" onChange={(e) => setName(e.target.value)} />

            {menus.map((menu: Menu) => (
                <div key={menu.menuId} style={{ border: "1px solid #ccc", marginTop: 10 }}>
                    <h4>{menu.name}</h4>

                    {menu.items.map((item: MenuItem) => (
                        <div key={item.itemId}>
                            <span>{item.name}</span>

                            <input
                                placeholder="Gram"
                                type="number"
                                onChange={(e) => {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    setMenuConfigs((prev: any) => ({
                                        ...prev,
                                        [menu.menuId]: {
                                            ...prev[menu.menuId],
                                            [item.itemId]: {
                                                ...prev?.[menu.menuId]?.[item.itemId],
                                                rawWeight: Number(e.target.value),
                                            },
                                        },
                                    }));
                                }}
                            />

                            <input
                                placeholder="Kcal"
                                type="number"
                                onChange={(e) => {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    setMenuConfigs((prev: any) => ({
                                        ...prev,
                                        [menu.menuId]: {
                                            ...prev[menu.menuId],
                                            [item.itemId]: {
                                                ...prev?.[menu.menuId]?.[item.itemId],
                                                calo: Number(e.target.value),
                                            },
                                        },
                                    }));
                                }}
                            />
                        </div>
                    ))}
                </div>
            ))}

            <button onClick={submit}>Lưu học sinh</button>
        </div>
    );
}
