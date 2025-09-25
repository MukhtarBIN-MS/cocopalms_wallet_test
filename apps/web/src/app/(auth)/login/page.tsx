"use client";
import { useState } from "react";
import { adminApi } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const { data } = await adminApi.post("/auth/login", { email, password });
      setToken(data.token);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? "Login failed");
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT: Form */}
      <div className="p-8 lg:p-16 flex items-center">
        <form onSubmit={onSubmit} className="w-full max-w-md">
          <div className="text-sm text-indigo-600 font-semibold mb-2">
            Sign Up
          </div>
          <div className="h1 mb-6">Get Started!</div>
          {err && <div className="text-red-600 text-sm mb-3">{err}</div>}
          <input
            className="input mb-3"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input mb-5"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full rounded-full bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition">
            Login
          </button>
        </form>
      </div>

      {/* RIGHT: Promo / Wallet mock matching Figma */}
      <div className="hidden lg:flex items-center justify-center bg-white/60">
        <div className="card p-8 max-w-lg w-full">
          <div className="h2 mb-3">Get Started</div>
          <div className="flex items-center gap-2 text-sm mb-6">
            <span>🟣</span>
            <span className="muted">With bloggers from around the world.</span>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-xl mx-auto w-[300px]">
            <div className="bg-teal-500 text-white p-4">
              <div className="flex justify-between items-center">
                <span className="font-bold">LOGO</span>
                <span className="px-3 py-1 rounded-full bg-white/20">
                  Bronze 10%
                </span>
              </div>
              <div className="text-sm mt-3">
                <div className="opacity-90">Customer</div>
                <div className="text-xl font-semibold -mt-1">John</div>
                <div className="opacity-90 mt-2">ID C13579246810</div>
                <div className="opacity-90">MEMBER SINCE 2025</div>
              </div>
            </div>
            <div className="bg-white p-5 grid place-items-center">
              {/* Fake QR block */}
              <div className="w-40 h-40 bg-[conic-gradient(at_50%_50%,#000_25%,#fff_0)] [mask-image:radial-gradient(circle,transparent_40%,#000_41%)] rounded" />
            </div>
            <div className="h-20 bg-[url('/coffee.jpg')] bg-cover bg-center"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
