// "use client";
// import { useState } from "react";
// import { adminApi } from "@/lib/api";
// import { setToken } from "@/lib/auth";
// import { useRouter } from "next/navigation";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [err, setErr] = useState<string | null>(null);
//   const router = useRouter();

//   async function onSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setErr(null);
//     try {
//       const { data } = await adminApi.post("/auth/login", { email, password });
//       setToken(data.token);
//       router.push("/dashboard");
//     }  catch (e: unknown) {
//       if (e instanceof Error) {
//         console.error(e.message);
//       } else {
//         console.error("Unknown error", e);
//       }
//     }
//   }

//   return (
//     <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
//       {/* LEFT: Form */}
//       <div className="p-8 lg:p-16 flex items-center">
//         <form onSubmit={onSubmit} className="w-full max-w-md">
//           <div className="text-sm text-indigo-600 font-semibold mb-2">
//             Sign Up
//           </div>
//           <div className="h1 mb-6">Get Started!</div>
//           {err && <div className="text-red-600 text-sm mb-3">{err}</div>}
//           <input
//             className="input mb-3"
//             placeholder="Email Address"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <input
//             className="input mb-5"
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <button className="w-full rounded-full bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition">
//             Login
//           </button>
//         </form>
//       </div>

//       {/* RIGHT: Promo / Wallet mock matching Figma */}
//       <div className="hidden lg:flex items-center justify-center bg-white/60">
//         <div className="card p-8 max-w-lg w-full">
//           <div className="h2 mb-3">Get Started</div>
//           <div className="flex items-center gap-2 text-sm mb-6">
//             <span>🟣</span>
//             <span className="muted">With bloggers from around the world.</span>
//           </div>

//           <div className="rounded-2xl overflow-hidden shadow-xl mx-auto w-[300px]">
//             <div className="bg-teal-500 text-white p-4">
//               <div className="flex justify-between items-center">
//                 <span className="font-bold">LOGO</span>
//                 <span className="px-3 py-1 rounded-full bg-white/20">
//                   Bronze 10%
//                 </span>
//               </div>
//               <div className="text-sm mt-3">
//                 <div className="opacity-90">Customer</div>
//                 <div className="text-xl font-semibold -mt-1">John</div>
//                 <div className="opacity-90 mt-2">ID C13579246810</div>
//                 <div className="opacity-90">MEMBER SINCE 2025</div>
//               </div>
//             </div>
//             <div className="bg-white p-5 grid place-items-center">
//               {/* Fake QR block */}
//               <div className="w-40 h-40 bg-[conic-gradient(at_50%_50%,#000_25%,#fff_0)] [mask-image:radial-gradient(circle,transparent_40%,#000_41%)] rounded" />
//             </div>
//             <div className="h-20 bg-[url('/coffee.jpg')] bg-cover bg-center"></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState } from "react";
import { adminApi } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const { data } = await adminApi.post("/auth/login", { email, password });
      setToken(data.token);
      router.push("/dashboard");
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e.message);
        setErr("Invalid email or password. Please try again.");
      } else {
        console.error("Unknown error", e);
        setErr("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT: Form */}
      <div className="p-8 lg:p-16 flex items-center">
        <form onSubmit={onSubmit} className="w-full max-w-md">
          <div className="text-sm text-indigo-600 font-semibold mb-2">Sign Up</div>
          <div className="h1 mb-6">Get Started!</div>

          {err && (
            <div className="text-red-600 text-sm mb-3 bg-red-50 border border-red-200 p-2 rounded">
              {err}
            </div>
          )}

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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>

      {/* RIGHT: Promo */}
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
                <span className="px-3 py-1 rounded-full bg-white/20">Bronze 10%</span>
              </div>
              <div className="text-sm mt-3">
                <div className="opacity-90">Customer</div>
                <div className="text-xl font-semibold -mt-1">John</div>
                <div className="opacity-90 mt-2">ID C13579246810</div>
                <div className="opacity-90">MEMBER SINCE 2025</div>
              </div>
            </div>
            <div className="bg-white p-5 grid place-items-center">
              <div className="w-40 h-40 bg-[conic-gradient(at_50%_50%,#000_25%,#fff_0)] [mask-image:radial-gradient(circle,transparent_40%,#000_41%)] rounded" />
            </div>
            <div className="h-20 bg-[url('/coffee.jpg')] bg-cover bg-center"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
