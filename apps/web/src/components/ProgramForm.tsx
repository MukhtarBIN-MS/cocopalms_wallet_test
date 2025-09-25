"use client";

import { memo, useState, DragEvent } from "react";
import { adminPost } from "@/lib/api"; // ✅ use admin client
import Image from "next/image";

/* ---- Extracted, stable components ---- */
type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
};
const Field = memo(function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: FieldProps) {
  return (
    <div className="grid md:grid-cols-[180px_1fr] items-center gap-4">
      <div className="text-sm text-gray-700">{label}</div>
      <input
        className="input input-bordered w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
      />
    </div>
  );
});

type SelectProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
};
const Select = memo(function Select({
  label,
  value,
  onChange,
  options,
}: SelectProps) {
  return (
    <div className="grid md:grid-cols-[180px_1fr] items-center gap-4">
      <div className="text-sm text-gray-700">{label}</div>
      <select
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
});
/* ------------------------------------- */

type Form = {
  name: string;
  minAmount: string;
  multi: string;
  expiryDate: string;
  lifespan: string;
  advance: string;
  terms: string;
  themeUrl: string;
};

function ProgramFormBase({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Form>({
    name: "",
    minAmount: "",
    multi: "",
    expiryDate: "",
    lifespan: "",
    advance: "",
    terms: "",
    themeUrl: "",
  });
  const [drag, setDrag] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    setForm((s) => ({ ...s, themeUrl: URL.createObjectURL(f) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    const amount = Number(form.minAmount);
    if (!form.name || isNaN(amount)) {
      setErr("Program name and valid amount are required.");
      return;
    }

    let expiryDate: string | undefined = undefined;
    if (form.expiryDate) {
      const d = new Date(form.expiryDate);
      if (!isNaN(d.getTime())) {
        expiryDate = d.toISOString();
      }
    }

    const themeUrl =
      form.themeUrl && /^https?:\/\//.test(form.themeUrl)
        ? form.themeUrl
        : undefined;

    setSaving(true);
    try {
      await adminPost("/programs", {
        name: form.name,
        description: form.terms || undefined,
        amount,
        expiryDate,
        themeUrl,
      });
      onCreated();
    }  catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e.message);
      } else {
        console.error("Unknown error", e);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {err && <div className="text-sm text-red-600">{err}</div>}

      <Field
        label="Program Name *"
        value={form.name}
        onChange={(v) => setForm((s) => ({ ...s, name: v }))}
        placeholder="e.g., Eid Gift 2025"
      />

      <Field
        label="Gift Card Amount *"
        value={form.minAmount}
        onChange={(v) => setForm((s) => ({ ...s, minAmount: v }))}
        placeholder="e.g., 25"
        type="number"
      />

      <Select
        label="Multiple Users"
        value={form.multi}
        onChange={(v) => setForm((s) => ({ ...s, multi: v }))}
        options={["Yes", "No"]}
      />

      <Field
        type="date"
        label="Optional Expiry Date"
        value={form.expiryDate}
        onChange={(v) => setForm((s) => ({ ...s, expiryDate: v }))}
        placeholder="Select a date"
      />

      <Select
        label="Life Span"
        value={form.lifespan}
        onChange={(v) => setForm((s) => ({ ...s, lifespan: v }))}
        options={["6 months", "1 year", "2 years", "No limit"]}
      />

      <Field
        label="Advance (optional)"
        value={form.advance}
        onChange={(v) => setForm((s) => ({ ...s, advance: v }))}
        placeholder="Advance Amount"
        type="number"
      />

      <div className="grid md:grid-cols-[180px_1fr] gap-4">
        <div className="text-sm text-gray-700">Short Description</div>
        <textarea
          className="textarea h-28"
          value={form.terms}
          onChange={(e) => setForm((s) => ({ ...s, terms: e.target.value }))}
          placeholder="Describe this program/template"
        />
      </div>

      <div className="grid md:grid-cols-[180px_1fr] gap-4">
        <div className="text-sm text-gray-700">Theme / Logo</div>
        <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
          <div
            className={`border-2 border-dashed rounded-xl h-[120px] flex items-center justify-center ${
              drag ? "border-blue-400 bg-blue-50" : "border-gray-300"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
          >
            {form.themeUrl ? (
              <Image
                src={form.themeUrl}
                className="w-[80px] h-[80px] object-cover rounded"
                alt="theme"
              />
            ) : (
              <div className="text-sm text-gray-500 text-center px-2">
                Drag image here
                <br />
                or <span className="text-blue-600 underline">Browse image</span>
              </div>
            )}
          </div>
          <div className="muted text-sm">Shown on the gift card design.</div>
        </div>
      </div>

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

export default memo(ProgramFormBase);
