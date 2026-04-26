"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { KIND_LABEL, PAYMENT_LABEL, Transaction } from "@/lib/types";
import { DEFAULT_TODAY } from "@/lib/useMonth";
import { formatMD, jpWeekday, yen } from "@/lib/calc";
import { FilterIcon, SearchIcon } from "@/components/icons";

type Filter = "all" | "living" | "business" | "income" | "fixed";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",      label: "すべて" },
  { key: "living",   label: "生活費" },
  { key: "business", label: "事業費" },
  { key: "income",   label: "収入" },
  { key: "fixed",    label: "固定費" },
];

export default function HistoryPage() {
  const { db, hydrated } = useStore();
  const [filter, setFilter] = useState<Filter>("all");

  const txs = useMemo(() => {
    return [...db.transactions]
      .filter((t) => match(t, filter))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [db.transactions, filter]);

  const grouped = useMemo(() => groupByDate(txs), [txs]);

  if (!hydrated) return null;

  return (
    <div className="bg-bg min-h-screen">
      <div className="statusbar" />
      <header className="px-4 pt-2 pb-3 flex items-center">
        <h1 className="text-lg font-semibold text-ink-900">履歴</h1>
        <div className="ml-auto flex items-center gap-3 text-ink-700">
          <button aria-label="検索"><SearchIcon className="w-5 h-5" /></button>
          <button aria-label="絞り込み"><FilterIcon className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="px-4 mb-2 -mx-4 overflow-x-auto no-scrollbar">
        <div className="px-4 inline-flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 h-9 rounded-full text-sm whitespace-nowrap font-semibold border ${
                filter === f.key
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-white text-ink-700 border-ink-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {txs.length === 0 ? (
        <div className="px-4 mt-12 text-center text-ink-500">該当する取引はありません</div>
      ) : (
        <div className="px-4 space-y-3">
          {grouped.map(({ date, items }) => (
            <section key={date} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-2 text-xs text-ink-500 border-b border-ink-100">
                {sameDate(date, DEFAULT_TODAY) ? `今日 ${formatMD(date)} (${jpWeekday(date)})` : `${formatMD(date)} (${jpWeekday(date)})`}
              </div>
              <ul className="divide-y divide-ink-100">
                {items.map((t) => <Item key={t.id} t={t} />)}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Item({ t }: { t: Transaction }) {
  const sub: string[] = [];
  if (t.memo) sub.push(t.memo);
  if (t.type === "expense" && t.kind && t.kind !== "living") sub.push(KIND_LABEL[t.kind]);
  if (t.type === "income") sub.push("収入");
  sub.push(PAYMENT_LABEL[t.paymentMethod]);

  const amountColor =
    t.type === "income"
      ? "text-brand-500"
      : t.type === "transfer"
      ? "text-ink-700"
      : "text-ink-900";

  return (
    <li className="px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-base">
        {emojiFor(t.category)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] text-ink-900 truncate">{t.category}</div>
        <div className="text-xs text-ink-500 truncate">{sub.filter(Boolean).join(" / ")}</div>
      </div>
      <div className="text-right">
        <div className={`tabular-nums font-semibold ${amountColor}`}>
          {t.type === "expense" ? "" : t.type === "income" ? "+" : ""}{yen(t.amount).replace("-", "")}
        </div>
        {t.type === "income" && (t.workCount || t.workMinutes) && (
          <div className="text-[11px] text-ink-500">
            {t.workCount ? `${t.workCount}件` : ""}
            {t.workCount && t.workMinutes ? " / " : ""}
            {t.workMinutes ? `${formatHM(t.workMinutes)}` : ""}
          </div>
        )}
      </div>
    </li>
  );
}

function formatHM(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h <= 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
}

function emojiFor(category: string) {
  switch (category) {
    case "食費":     return "🍱";
    case "ガソリン": return "⛽";
    case "日用品":   return "🧴";
    case "医療":     return "🏥";
    case "交通":     return "🚃";
    case "通信":     return "📶";
    case "娯楽":     return "🎬";
    case "衣服":     return "👕";
    case "Uber売上": return "🚗";
    case "出前館売上": return "🛵";
    case "消耗品":   return "📦";
    case "外注費":   return "🧑‍💻";
    case "広告":     return "📣";
    default:        return "💴";
  }
}

function match(t: Transaction, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "income") return t.type === "income";
  if (filter === "fixed") return t.type === "expense" && t.kind === "fixed";
  if (filter === "living") return t.type === "expense" && t.kind === "living";
  if (filter === "business") return t.type === "expense" && (t.kind === "business" || t.kind === "apportion");
  return true;
}

function groupByDate(txs: Transaction[]): { date: string; items: Transaction[] }[] {
  const m = new Map<string, Transaction[]>();
  for (const t of txs) {
    if (!m.has(t.date)) m.set(t.date, []);
    m.get(t.date)!.push(t);
  }
  return [...m.entries()].map(([date, items]) => ({ date, items }));
}

function sameDate(iso: string, d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return iso === `${y}-${m}-${day}`;
}

