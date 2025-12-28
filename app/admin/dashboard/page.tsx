"use client";
import { useEffect, useState } from "react";

import { Menu, MenuVote, Student, Vote } from "@/type";

export default function AdminDashboard() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);

  const [date, setDate] = useState("");
  const [type, setType] = useState("lunch");

  const [tab, setTab] = useState<"menus" | "students" | "votes">("votes");

  const loadAll = async () => {
    const [m, s, v] = await Promise.all([
      fetch("/api/menus").then(r => r.json()),
      fetch("/api/students").then(r => r.json()),
      fetch("/api/votes").then(r => r.json())
    ]);
    setMenus(m.menus);
    setStudents(s.students);
    setVotes(v);
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

  return (
    <div style={{ padding: 24 }}>
      <h1>ADMIN DASHBOARD</h1>

      {/* OVERVIEW */}
      <div className="block">
        <h2>Overview</h2>
        <p>🍱 Menus: {menus.length}</p>
        <p>👨‍🎓 Students: {students.length}</p>
        <p>🗳 Active votes: {votes.filter(v => !v.winner).length}</p>
      </div>

      {/* OPEN VOTE */}
      <div className="block">
        <h2>Open Vote</h2>
        <input type="date" onChange={e => setDate(e.target.value)} />
        <select onChange={e => setType(e.target.value)}>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>
        <button onClick={openVote}>OPEN</button>
      </div>

      {/* ACTIVE VOTES */}
      <div className="block">
        <h2>Active Votes</h2>

        {votes.filter(v => !v.winner).map(v => (
          <div key={v.date + v.type} className="block">
            <b>{v.date} – {v.type}</b>

            {v.menus.map((m: MenuVote) => (
              <div key={m.menuId}>
                {m.menuId} → {m.votedStudentIds.length} vote
              </div>
            ))}

            <button onClick={() => closeVote(v.date, v.type)}>
              CLOSE VOTE
            </button>
          </div>
        ))}
      </div>

      {/* DATA INSPECTOR */}
      <div className="block">
        <h2>Data Inspector</h2>

        <button onClick={() => setTab("votes")}>Votes</button>
        <button onClick={() => setTab("menus")}>Menus</button>
        <button onClick={() => setTab("students")}>Students</button>

        <pre style={{ maxHeight: 300, overflow: "auto" }}>
          {JSON.stringify(
            tab === "votes" ? votes :
            tab === "menus" ? menus :
            students,
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
