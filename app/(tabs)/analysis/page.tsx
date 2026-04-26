"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { breakdownByCategory, sum } from "@/lib/calc";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import { Donut } from "@/components/Donut";
import { monthLabelLong, useMonth } from "@/lib/useMonth";
import type { Transaction } from "@/lib/types";

const PALETTE = ["#F39C5F", "#22A055", "#F4D03F", "#A569C9", "#E76F8A", "#5DADE2"];

type Tab = "expense" | "business" | "diff";

export default function AnalysisPage() {
  const { db, hydrated } = useStore();
  const { month, shift } = useMonth();
  const [tab, setTab] = useState<Tab>("expense");

  const monthTxs = useMemo(
    () => db.transactions.filter((t) => t.date.startsWith(month)),
    [db.transactions, month]
  );

  const prevMonth = useMemo(() => prev(month), [month]);
  const prevTxs = useMemo(
    () => db.transactions.filter((t) => t.date.startsWith(prevMonth)),
    [db.transactions, prevMonth]
  );

  const livingBreakdown = useMemo(
    () => breakdownByCategory(monthTxs, (t) => t.type === "expense" && t.kind === "living", 5),
    [monthTxs]
  );
  const businessBreakdown = useMemo(
    () => breakdownByCategory(monthTxs, (t) => t.type === "expense" && (t.kind === "business" || t.kind === "apportion"), 5),
    [monthTxs]
  );

  if (!hydrated) return null;

  const active = tab === "business" ? businessBreakdown : livingBreakdown;
  const headerLabel = tab === "business" ? "事業費合計" : "生活費合計";

  return (
    <div className="bg-bg min-h-screen">
      <div className="statusbar" />
      <header className="px-4 pt-2 pb-3">
        <h1 className="text-lg font-semibold text-ink-900 text-center">分析</h1>
      </header>

      <div className="px-4">
        {/* 月ピッカー */}
        <div className="bg-white rounded-2xl shadow-sm flex items-center justify-between px-3 h-12">
          <button onClick={() => shift(-1)} className="p-2 text-ink-500"><ChevronLeft className="w-5 h-5" /></button>
          <div className="font-semibold text-ink-900">{monthLabelLong(month)}</div>
          <button onClick={() => shift(1)} className="p-2 text-ink-500"><ChevronRight className="w-5 h-5" /></button>
        </div>

        {/* タブ */}
        <div className="mt-3 -mx-4 overflow-x-auto no-scrollbar">
          <div className="px-4 inline-flex gap-2">
            {[
              { k: "expense"  as const, l: "支出の内訳" },
              { k: "business" as const, l: "事業費の内訳" },
              { k: "diff"     as const, l: "先月との差" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`px-4 h-9 rounded-full text-sm whitespace-nowrap font-semibold border ${
                  tab === t.k ? "bg-brand-500 text-white border-brand-500" : "bg-white text-ink-700 border-ink-100"
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>

        {tab !== "diff" ? (
          <>
            {/* ドーナツ */}
            <section className="mt-3 bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
              <div className="relative w-[168px] h-[168px] flex-none">
                <Donut slices={active.items.map((it, i) => ({ label: it.category, value: it.amount, color: PALETTE[i % PALETTE.length] }))} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div className="text-[11px] text-ink-500">{headerLabel}</div>
                  <div className="text-base font-bold text-ink-900 tabular-nums">
                    {active.total.toLocaleString("ja-JP")}
                  </div>
                </div>
              </div>
              <ul className="flex-1 space-y-1.5">
                {active.items.map((it, i) => (
                  <li key={it.category} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                    <span className="text-ink-700 flex-1 truncate">{it.category}</span>
                    <span className="tabular-nums text-ink-500">{(it.ratio * 100).toFixed(1)}%</span>
                    <span className="tabular-nums text-ink-900 ml-2">{it.amount.toLocaleString("ja-JP")}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* ランキング */}
            <section className="mt-3 bg-white rounded-2xl shadow-sm p-4">
              <h2 className="text-sm font-semibold text-ink-900 mb-2">今月の支出ランキング</h2>
              <ol className="divide-y divide-ink-100">
                {active.items.map((it, i) => (
                  <li key={it.category} className="py-2.5 flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? "bg-amber-100 text-amber-700" :
                      i === 1 ? "bg-ink-100 text-ink-700" :
                      i === 2 ? "bg-orange-100 text-orange-600" :
                      "bg-bg text-ink-500"
                    }`}>
                      {i < 3 ? ["🥇","🥈","🥉"][i] : i + 1}
                    </span>
                    <span className="flex-1 text-[15px] text-ink-900">{it.category}</span>
                    <span className="tabular-nums text-ink-900">{it.amount.toLocaleString("ja-JP")}<span className="text-xs ml-0.5">円</span></span>
                  </li>
                ))}
              </ol>
            </section>
          </>
        ) : (
          <DiffView monthTxs={monthTxs} prevTxs={prevTxs} />
        )}
      </div>
    </div>
  );
}

function DiffView({ monthTxs, prevTxs }: { monthTxs: Transaction[]; prevTxs: Transaction[] }) {
  const cats = new Set<string>();
  for (const t of [...monthTxs, ...prevTxs]) {
    if (t.type === "expense") cats.add(t.category);
  }
  const rows = [...cats].map((c) => {
    const cur = sum(monthTxs.filter((t) => t.type === "expense" && t.category === c), (t) => t.amount);
    const prv = sum(prevTxs.filter((t) => t.type === "expense" && t.category === c), (t) => t.amount);
    return { category: c, cur, prv, diff: cur - prv };
  }).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  return (
    <section className="mt-3 bg-white rounded-2xl shadow-sm p-4">
      <h2 className="text-sm font-semibold text-ink-900 mb-2">先月との差</h2>
      <ul className="divide-y divide-ink-100">
        {rows.map((r) => (
          <li key={r.category} className="py-2.5 flex items-center gap-3">
            <span className="flex-1 text-[15px] text-ink-900">{r.category}</span>
            <span className="text-xs text-ink-500 tabular-nums">先月 {r.prv.toLocaleString("ja-JP")}</span>
            <span className={`tabular-nums text-sm w-20 text-right ${
              r.diff > 0 ? "text-red-500" : r.diff < 0 ? "text-brand-500" : "text-ink-700"
            }`}>
              {r.diff > 0 ? "+" : ""}{r.diff.toLocaleString("ja-JP")}
            </span>
          </li>
        ))}
        {rows.length === 0 && <li className="py-6 text-center text-ink-500 text-sm">比較できるデータがありません</li>}
      </ul>
    </section>
  );
}

function prev(month: string) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

