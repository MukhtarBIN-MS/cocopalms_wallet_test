"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getToken, clearToken } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const path = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!getToken()) router.replace("/login");
    else setAuthed(true);
  }, [router]);

  if (!authed) return null;

  const NavItem = ({
    href,
    label,
    icon,
  }: {
    href: string;
    label: string;
    icon: string;
  }) => {
    const active =
      href === "/dashboard" ? path === "/dashboard" : path.startsWith(href);

    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
          ${
            active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
          }`}
      >
        <span>{icon}</span>
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="p-4 border-r bg-white">
        <div className="flex items-center gap-2 mb-6">
          <Image
            src="/avatar.png"
            alt="Avatar"
            width={8}
            height={8}
            className="w-8 h-8 rounded-full object-cover"
          />

          <div className="font-semibold">UBS</div>
        </div>
        <nav className="space-y-2">
          <NavItem href="/dashboard" label="Dashboard" icon="🎛️" />
          <NavItem href="/dashboard/programs" label="Programs" icon="🪙" />
          <NavItem href="/dashboard/users" label="Users" icon="👤" />
        </nav>
        <button
          onClick={() => {
            clearToken();
            router.replace("/login");
          }}
          className="mt-8 text-sm text-red-600"
        >
          Logout
        </button>
      </aside>

      {/* Topbar + page content */}
      <div className="flex flex-col">
        <header className="w-full flex items-center justify-between px-6 py-3 border-b bg-white">
          <div className="text-sm text-gray-500">
            {path === "/dashboard/programs" && "Programs"}
            {path === "/dashboard/users" && "Users"}
            {path === "/dashboard/" && "Dashboard"}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Admin</span>
            <div className="w-8 h-8 rounded-full bg-gray-300" />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
