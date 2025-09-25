"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

/** ---------------- Config ---------------- */
// Use the PUBLIC mount
const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "") +
  "/api/public";

/** ---------------- Types ----------------- */
type Program = { _id: string; name: string };
type ProgramsResponse = { items: Program[] };
type CreateUserResponse = { item: { gwSaveLink?: string | null } };

/** -------------- Helpers ----------------- */
function toISODateString(v: string | undefined) {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url); // public; no admin token
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function postJSON<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // public; no Authorization
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try {
      const data = JSON.parse(text);
      msg =
        typeof data?.error === "string"
          ? data.error
          : data?.message || "Request failed";
    } catch {}
    throw new Error(msg);
  }
  return JSON.parse(text);
}

/** -------------- UI Page ----------------- */
export default function ClaimPage() {
  // form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [programId, setProgramId] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  // data state
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  // submit state
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saveLink, setSaveLink] = useState<string | null>(null);

  // fetch programs (public)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingPrograms(true);
        const data = await getJSON<ProgramsResponse>(`${API_BASE}/programs`);
        if (!mounted) return;
        setPrograms((data?.items ?? []).filter(Boolean));
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.error(e.message);
        } else {
          console.error("Unknown error", e);
        }
      }finally {
        if (mounted) setLoadingPrograms(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length >= 2 &&
      /^\S+@\S+\.\S+$/.test(email) &&
      mobile.trim().length >= 6 &&
      !!programId &&
      !!dob &&
      agreeTerms
    );
  }, [fullName, email, mobile, programId, dob, agreeTerms]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSuccessMsg(null);
    setSaveLink(null);

    if (!canSubmit) {
      setErr("Please fill all required fields and accept the terms.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: mobile.trim(),
        dob: toISODateString(dob),
        programId,
      };

      const res = await postJSON<CreateUserResponse>(
        `${API_BASE}/users`,
        payload
      );

      const link = res?.item?.gwSaveLink || null;
      setSaveLink(link);

      // Always treat as success; message depends on whether we have a Wallet link
      setSuccessMsg(
        link
          ? "User created. You can now add the card to Google Wallet."
          : "User created successfully. Wallet link is not available yet."
      );
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e.message);
      } else {
        console.error("Unknown error", e);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-lg px-5 py-10">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Get Benefits With Our Purchase
        </h1>

        {loadErr && (
          <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
            {loadErr}
          </div>
        )}
        {err && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {err}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2">
            {successMsg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="input input-bordered w-full"
            placeholder="Full Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="input input-bordered w-full"
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input input-bordered w-full"
            placeholder="Mobile *"
            inputMode="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />

          <input
            className="input input-bordered w-full"
            placeholder="Date of Birth *"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />

          <select
            className="select w-full"
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            disabled={loadingPrograms}
          >
            <option value="">
              {loadingPrograms ? "Loading programs..." : "Select Program *"}
            </option>
            {programs.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <label className="flex items-start gap-2 pt-3">
            <input
              type="checkbox"
              className="mt-1 accent-emerald-600"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <span className="text-sm">
              I have read and accept the terms of use.
            </span>
          </label>

          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 accent-emerald-600"
              checked={agreeMarketing}
              onChange={(e) => setAgreeMarketing(e.target.checked)}
            />
            <span className="text-sm">
              I agree that my personal data can be used and provided for direct
              marketing purposes.
            </span>
          </label>

          <div className="pt-4 flex flex-col items-center gap-3">
            {saveLink ? (
              <>
                <a
                  href={saveLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900 transition"
                >
                  <Image
                    src="/google_wallet_icon.png"
                    alt="Google Wallet"
                    className="w-6 h-6"
                  />
                  Add to Google Wallet
                </a>
                <p className="text-xs text-gray-600">
                  This card will be immediately added to your Wallet.
                </p>
              </>
            ) : (
              <button
                className="w-full rounded-full bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition"
                disabled={!canSubmit || submitting}
              >
                {submitting ? "Processing..." : "Submit"}
              </button>
            )}
          </div>
        </form>

        <div className="mt-8 space-y-3">
          <details className="rounded-xl bg-white border p-4">
            <summary className="cursor-pointer font-medium">
              Company Information
            </summary>
            <div className="mt-2 text-sm text-gray-600">
              Company details, terms, or promotional notes.
            </div>
          </details>

          <details className="rounded-xl bg-white border p-4">
            <summary className="cursor-pointer font-medium">
              Card Information
            </summary>
            <div className="mt-2 text-sm text-gray-600">
              What the customer receives, usage limits, and expiry details.
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
