"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/consultation", label: "Consultation", icon: "💬" },
  { href: "/image-analysis", label: "Image Analysis", icon: "📸" },
  { href: "/records", label: "Health Records", icon: "📋" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="mobile-header">
        <button className="hamburger-btn" onClick={() => setMobileOpen(true)}>
          ☰
        </button>
        <div className="sidebar-logo" style={{ marginLeft: 8 }}>
          <span className="sidebar-logo-text">AfyaScribe</span>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <Link
            href="/"
            className="sidebar-logo"
            onClick={() => setMobileOpen(false)}
          >
            <div className="sidebar-logo-icon">🏥</div>
            <span className="sidebar-logo-text">AfyaScribe</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-link-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-footer-text">
            ⚕️ AfyaScribe v1.0
            <br />
            Powered by Google Gemini
          </p>
        </div>
      </aside>
    </>
  );
}
