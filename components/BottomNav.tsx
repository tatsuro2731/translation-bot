"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnalysisIcon, FixedIcon, HistoryIcon, HomeIcon, InputIcon } from "./icons";

const items = [
  { href: "/home",     label: "ホーム", Icon: HomeIcon },
  { href: "/input",    label: "入力",   Icon: InputIcon, big: true },
  { href: "/history",  label: "履歴",   Icon: HistoryIcon },
  { href: "/fixed",    label: "固定費", Icon: FixedIcon },
  { href: "/analysis", label: "分析",   Icon: AnalysisIcon },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-white border-t border-ink-100 z-30"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <ul className="grid grid-cols-5 h-[64px] items-center">
        {items.map(({ href, label, Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 text-[11px] ${
                  active ? "text-brand-500" : "text-ink-500"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
