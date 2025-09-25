"use client";

import useSWR from "swr";
import { QrCodeIcon } from "@heroicons/react/24/outline";
import { useMemo, useState, useCallback } from "react";
import { adminGet } from "@/lib/api";
import Modal from "@/components/Modal";
import UserForm from "@/components/UserForm";

type UserRow = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  gwSaveLink?: string | null;
  createdAt?: string;
};
type UsersResponse = { items: UserRow[] };

export default function UsersPage() {
  const { data, isLoading, mutate } = useSWR<UsersResponse>(
    "/users",
    (url: string) => adminGet<UsersResponse>(url)
  );
  const [q, setQ] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const items: UserRow[] = (data?.items ?? []).filter(Boolean);

  const filtered = useMemo(() => {
    let list = items;
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(needle) ||
          u.email.toLowerCase().includes(needle) ||
          (u.phone ?? "").toLowerCase().includes(needle)
      );
    }
    if (dateFilter !== "all") {
      const days = { "7d": 7, "30d": 30, "90d": 90 }[dateFilter]!;
      const since = Date.now() - days * 24 * 60 * 60 * 1000;
      list = list.filter((u) =>
        u.createdAt ? new Date(u.createdAt).getTime() >= since : true
      );
    }
    return list;
  }, [items, q, dateFilter]);

  function downloadCSV() {
    const rows = [
      ["Name", "Email", "Phone", "Wallet Link"],
      ...filtered.map((u) => [
        u.fullName,
        u.email,
        u.phone ?? "-",
        u.gwSaveLink ?? "-",
      ]),
    ];
    const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "users.csv";
    a.click();
  }
  const esc = (v: string) => {
    const s = String(v ?? "");
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  return (
    <>
      <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="h2">Roles</div>

        <div className="flex gap-3 items-center">
            <button
              onClick={() => setOpen(true)}
              className="px-3 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold flex items-center gap-2"
            >
              <span className="inline-grid place-items-center w-6 h-6 rounded bg-black text-white">
                ＋
              </span>
              User
            </button>
          </div>
        </div>
  

        {/* Toolbar */}
        <div className="card p-3 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              className="select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Filter Date</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>

            <div className="relative">
              <input
                className="input !rounded-[10px] !bg-white w-64"
                placeholder="Search..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <span className="absolute right-3 top-2.5">🔎</span>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <button onClick={downloadCSV} className="">
              ⬇️ Download
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              )}

              {!isLoading &&
                filtered.map((u) => (
                  <tr key={u._id}>
                    <td className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-pink-100 grid place-items-center">
                        🟣
                      </span>
                      {u.fullName}
                    </td>
                    <td>{u.email}</td>
                    <td className="whitespace-nowrap">{u.phone ?? "—"}</td>
                    <td>
                      {u.gwSaveLink ? (
                        <a
                          href={u.gwSaveLink}
                          target="_blank"
                          rel="noreferrer"
                          title="Open Wallet Link"
                          className="inline-flex items-center text-emerald-600 hover:text-emerald-800"
                        >
                          <QrCodeIcon className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}

              {!isLoading && !filtered.length && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="New User">
        <UserForm
          onCreated={() => {
            setOpen(false);
            mutate();
          }}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
