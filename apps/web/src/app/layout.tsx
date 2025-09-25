import "./globals.css";

export const metadata = {
  title: "Wallet Admin",
  description: "Admin panel for Google Wallet programs & users"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F7F7FB] text-slate-900">{children}</body>
    </html>
  );
}
