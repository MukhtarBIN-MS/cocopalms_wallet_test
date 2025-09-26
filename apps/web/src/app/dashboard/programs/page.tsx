"use client";

import useSWR from "swr";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useMemo, useState, useCallback } from "react";
import { adminGet, adminDelete } from "@/lib/api";
import Modal from "@/components/Modal";
import ProgramForm from "@/components/ProgramForm";

type Program = {
  _id: string;
  name: string;
  amount: number;
  cashbackPct?: number;
  expiryDate?: string | null;
  multiUser?: boolean;
  description?: string;
  themeUrl?: string;
};

type ProgramResponse = { items: Program[] };

export default function ProgramsPage() {
  const { data, isLoading, mutate } = useSWR<ProgramResponse>(
    "/programs",
    (url: string) => adminGet<ProgramResponse>(url)
  );
  const [q, setQ] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [open, setOpen] = useState(false);

  // 👇 ADDED: which program we're editing (null = creating)
  const [editing, setEditing] = useState<Program | null>(null);

  const items: Program[] = (data?.items ?? []).filter(Boolean);

  const filtered = useMemo(() => {
    let list = items;
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          String(p.amount).includes(needle)
      );
    }
    if (dateFilter !== "all") {
      const now = Date.now();
      const horizon = { "7d": 7, "30d": 30, "90d": 90 }[dateFilter]!;
      list = list.filter((p) => {
        if (!p.expiryDate) return false;
        const d = new Date(p.expiryDate).getTime();
        return d - now <= horizon * 24 * 60 * 60 * 1000 && d >= now;
      });
    }
    return list;
  }, [items, q, dateFilter]);

  const downloadCSV = useCallback(() => {
    const rows = [
      ["Name", "Minimum Amt", "Cashback %", "Expiry", "Multiple User"],
      ...filtered.map((p) => [
        p.name,
        `${p.amount} kwd`,
        `${p.cashbackPct ?? 10}%`,
        p.expiryDate ? new Date(p.expiryDate).toLocaleString() : "-",
        p.multiUser ? "Yes" : "No",
      ]),
    ];
    const csv = rows.map((r) => r.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "programs.csv";
    a.click();
  }, [filtered]);

  // 👇 UPDATED: open create clears editing
  const handleOpen = useCallback(() => {
    setEditing(null);
    setOpen(true);
  }, []);

  // 👇 ADDED: open edit with selected program
  const handleOpenEdit = useCallback((p: Program) => {
    setEditing(p);
    setOpen(true);
  }, []);

  const onDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this program?")) return;
      await adminDelete(`/programs/${id}`);
      mutate();
    },
    [mutate]
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="h2">Recent Transactions</div>

          <div>
            <button
              onClick={handleOpen}
              className="px-3 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-semibold flex items-center gap-2"
            >
              <span className="inline-grid place-items-center w-6 h-6 rounded bg-black text-white">
                ＋
              </span>
              Program
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
              <option value="7d">Next 7 days</option>
              <option value="30d">Next 30 days</option>
              <option value="90d">Next 90 days</option>
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
            <button onClick={downloadCSV}>⬇️ Download</button>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Minimum Amt</th>
                <th>Cashback %</th>
                <th>Expiry</th>
                <th>Multiple User</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading &&
                filtered.map((p) => (
                  <tr key={p._id}>
                    <td className="font-medium">{p.name}</td>
                    <td>{p.amount} kwd</td>
                    <td>{p.cashbackPct ?? 10}%</td>
                    <td>
                      {p.expiryDate
                        ? (() => {
                          const d = new Date(p.expiryDate);
                          const date = d
                            .toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            })
                            .replace(/\//g, "-");
                          const time = d
                            .toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })
                            .toLowerCase();
                          return `${date} | ${time.replace(" ", "")}`;
                        })()
                        : "-"}
                    </td>

                    <td>
                      <input
                        type="checkbox"
                        className="accent-green-600"
                        defaultChecked={!!p.multiUser}
                        onChange={() => { }}
                      />
                    </td>
                    <td className="flex gap-2">
                      <button
                        className="btn-ghost h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100"
                        title="Edit"
                        onClick={() => handleOpenEdit(p)}
                      >
                        <PencilSquareIcon className="h-5 w-5 text-gray-600" />
                      </button>

                      <button
                        className="btn-ghost h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gray-100"
                        title="Delete"
                        onClick={() => onDelete(p._id)}
                      >
                        <TrashIcon className="h-5 w-5 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              {!isLoading && !filtered.length && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    No programs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit Program" : "New Program"}
        width="max-w-3xl"
      >
        <ProgramForm
          initial={
            editing
              ? {
                id: editing._id,
                name: editing.name,
                amount: editing.amount,
                cashbackPct: editing.cashbackPct ?? 10,
                expiryDate: editing.expiryDate ?? null,
                multiUser: !!editing.multiUser,
                description: editing.description ?? "",
                themeUrl: editing.themeUrl ?? "",
              }
              : undefined
          }
          onCreated={async () => {
            setOpen(false);
            setEditing(null);
            await mutate();
          }}
          onCancel={() => {
            setOpen(false);
            setEditing(null);
          }}
        />
      </Modal>
    </>
  );
}

function escapeCSV(v: string) {
  const s = String(v ?? "");
  return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
