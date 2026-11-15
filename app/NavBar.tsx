"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "To-do" },
];

const COMING_SOON = ["Recipes", "Saved"];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 19c0-8 5-13 14-14 0 9-5 14-14 14z" />
            <path d="M5 19c3-5 6-8 9-10" />
          </svg>
          EcoPlate
        </Link>

        <nav className="nav-links" aria-label="Main">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </Link>
            );
          })}
          {COMING_SOON.map((label) => (
            <span key={label} className="nav-link disabled" aria-disabled="true" title="Coming soon">
              {label}
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}