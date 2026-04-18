import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hevy Dashboard",
  description: "Your personal Hevy training dashboard",
};

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/routines",
    label: "Routines",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
        <path d="M4 6h16M4 10h16M4 14h10M4 18h6" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    href: "/coach",
    label: "Coach",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={20} height={20}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-screen flex font-sans" style={{ background: "var(--background)" }}>

        {/* ── Desktop sidebar ── */}
        <aside
          className="hidden md:flex flex-col shrink-0 w-56"
          style={{
            background: "var(--surface)",
            borderRight: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            height: "100vh",
          }}
        >
          <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0"
              style={{ background: "var(--accent)" }}
            >
              H
            </div>
            <span className="font-bold text-white text-base tracking-tight">Hevy</span>
          </div>

          <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
            {NAV_ITEMS.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-400 hover:text-white hover:bg-white/5"
              >
                <span style={{ color: "var(--accent)" }}>{icon}</span>
                {label}
              </Link>
            ))}
          </nav>

          <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Ohad's Dashboard</p>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 overflow-y-auto pb-20 md:pb-0">
          {children}
        </div>

        {/* ── Mobile bottom tab bar ── */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 z-50"
          style={{
            background: "var(--surface)",
            borderTop: "1px solid var(--border)",
            height: 60,
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {NAV_ITEMS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors text-gray-500 hover:text-white"
            >
              <span style={{ color: "var(--accent)" }}>{icon}</span>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </nav>

      </body>
    </html>
  );
}
