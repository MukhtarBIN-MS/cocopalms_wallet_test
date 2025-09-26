"use client";

import { memo, useState } from "react";
import useSWR from "swr";
import { adminGet, adminPost } from "@/lib/api"; // ✅ use admin helpers

type Program = {
  _id: string;
  name: string;
  amount: number;
  description?: string;
  expiryDate?: string;
  themeUrl?: string;
  gwClassId?: string;
};
type ProgramsResponse = { items: Program[] };

const Row = memo(function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid md:grid-cols-[180px_1fr] items-center gap-4">
      <div className="text-sm text-gray-700">{label}</div>
      {children}
    </div>
  );
});

function UserFormBase({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [programId, setProgramId] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const {
    data: progData,
    isLoading: loadingPrograms,
    error: progErr,
  } = useSWR<ProgramsResponse>("/programs", (url: string) =>
    adminGet<ProgramsResponse>(url)
  );

  const programs =
    progData?.items?.map((p) => ({ _id: p._id, name: p.name })) ?? [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!fullName || !email || !programId) {
      setErr("Full name, email, and program are required.");
      return;
    }

    setSaving(true);
    try {
      await adminPost("/users", {
        fullName,
        phone,
        email,
        dob: dob ? new Date(dob).toISOString() : undefined,
        programId,
      });
      onCreated();
    }catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setErr(msg);       
      setSaving(false);
    }finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {progErr && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          Couldn’t load programs: {(progErr as Error).message}
        </div>
      )}
      {err && <div className="text-sm text-red-600">{err}</div>}

      <Row label="Full Name *">
        <input
          type="text"
          className="input input-bordered w-full"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter full name"
          required
        />
      </Row>

      <Row label="Email *">
        <input
          className="input input-bordered w-full"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          required
        />
      </Row>

      <Row label="Phone *">
        <input
          className="input input-bordered w-full"
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone"
          required
        />
      </Row>

      <Row label="Date of Birth">
        <input
          className="input input-bordered w-full"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
      </Row>

      <Row label="Program *">
        <select
          className="select w-full"
          value={programId}
          onChange={(e) => setProgramId(e.target.value)}
          disabled={loadingPrograms || !progData}
          required
        >
          <option value="">
            {loadingPrograms ? "Loading programs..." : "Select program"}
          </option>
          {programs.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </Row>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Discard
        </button>
        <button className="btn" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

export default memo(UserFormBase);
