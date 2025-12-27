"use client";

import { useEffect, useState } from "react";
import { Menu } from "@/type";

function genId(prefix: string) {
    return prefix + "_" + Math.random().toString(36).slice(2, 8);
}

export default function MenuPage() {
    const [name, setName] = useState("");
    const [items, setItems] = useState([
        { name: "", category: "" },
        { name: "", category: "" },
        { name: "", category: "" },
    ]);

    const [curMenus, setCurmenus] = useState<Menu[]>([])

    useEffect(() => {
        fetch('/api/menus')
            .then(res => res.json())
            .then((data) => {
                console.log(data);
                setCurmenus(data.menus)
            })
    }, [])

    const submit = async () => {
        const menu = {
            menuId: genId("MENU"),
            name,
            items: items.map((i) => ({
                itemId: genId("FOOD"),
                name: i.name,
                category: i.category,
            })),
        };

        await fetch("/api/menus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(menu),
        });

        alert("Đã lưu thực đơn");
        setName("");
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Tạo thực đơn</h2>

            <input
                placeholder="Tên thực đơn"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            {items.map((item, idx) => (
                <div key={idx}>
                    <input
                        placeholder="Tên món"
                        onChange={(e) => {
                            const copy = [...items];
                            copy[idx].name = e.target.value;
                            setItems(copy);
                        }}
                    />
                    <input
                        placeholder="Nhóm chất"
                        onChange={(e) => {
                            const copy = [...items];
                            copy[idx].category = e.target.value;
                            setItems(copy);
                        }}
                    />
                </div>
            ))}

            <button onClick={submit}>Lưu</button>
            <hr /><br />
            <hr />
            <div>

                {curMenus.length > 0 && (
                    <div>
                        <h2> danh sach menu hien tai</h2>

                        {curMenus.map((menu, i) => {
                            return (
                                <div key={i}>
                                    <div> {menu.menuId} --- {menu.name} </div>
                                    {menu.items.map((item, idx) => {
                                        return (
                                            <div key={idx}>
                                                <p> {item.itemId} --- {item.category} ---{item.name}</p>
                                            </div>
                                        )
                                    })}
                                    <hr />
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
