"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
        <path d="M4 6h16M4 10h16M4 14h10M4 18h6" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    href: "/coach",
    label: "Coach",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Top header bar */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", height: 52 }}
      >
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col gap-1.5 p-1 rounded-lg"
          aria-label="Open menu"
        >
          <span className="block w-5 h-0.5 rounded-full bg-white" />
          <span className="block w-5 h-0.5 rounded-full bg-white" />
          <span className="block w-5 h-0.5 rounded-full bg-white" />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-black"
            style={{ background: "var(--accent)" }}
          >
            H
          </div>
          <span className="font-bold text-white text-sm tracking-tight">Hevy</span>
        </div>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in sidebar */}
      <aside
        className="md:hidden fixed top-0 left-0 bottom-0 z-50 flex flex-col w-64 transition-transform duration-250"
        style={{
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transitionProperty: "transform",
          transitionDuration: "250ms",
          transitionTimingFunction: "ease-in-out",
        }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
              style={{ background: "var(--accent)" }}
            >
              H
            </div>
            <span className="font-bold text-white text-base tracking-tight">Hevy</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-white p-1 rounded-lg"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: active ? "rgba(255,105,34,0.12)" : "transparent",
                  color: active ? "var(--accent)" : "#9ca3af",
                }}
              >
                <span style={{ color: "var(--accent)" }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="text-xs" style={{ color: "var(--muted)" }}>Ohad's Dashboard</p>
        </div>
      </aside>
    </>
  );
}
