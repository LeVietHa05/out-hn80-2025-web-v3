"use client";

import { useState } from "react";

export default function OpenVotePage() {
    const [date, setDate] = useState("");
    const [type, setType] = useState("lunch");

    const openVote = async () => {
        await fetch(`/api/daily-menu?date=${date}&type=${type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, type })
        });

        alert("Đã mở vote");
    };

    return (
        <div style={{ padding: 20 }}>
            <h2>Mở vote</h2>

            <input type="date" onChange={e => setDate(e.target.value)} />
            <select onChange={e => setType(e.target.value)}>
                <option value="lunch">Trưa</option>
                <option value="dinner">Tối</option>
            </select>

            <button onClick={openVote}>Mở</button>
        </div>
    );
}
