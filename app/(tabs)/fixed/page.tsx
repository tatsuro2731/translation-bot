"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { sum, yen } from "@/lib/calc";
import { CheckIcon, PlusIcon } from "@/components/icons";
import { useMonth } from "@/lib/useMonth";
import type { FixedCost } from "@/lib/types";

export default function FixedPage() {
  const { db, hydrated, toggleFixedPaid, addFixedCost, removeFixedCost } = useStore();
  const { month } = useMonth();
  const [tab, setTab] = useState<"month" | "year">("month");
  const [adding, setAdding] = useState(false);

  const total = useMemo(() => sum(db.fixedCosts, (f) => f.amount), [db.fixedCosts]);

  if (!hydrated) return null;

  return (
    <div className="bg-bg min-h-screen">
      <div className="statusbar" />
      <header className="px-4 pt-2 pb-3 flex items-center">
        <h1 className="text-lg font-semibold text-ink-900">固定費</h1>
        <button
          onClick={() => setAdding(true)}
          className="ml-auto flex items-center gap-1 text-brand-500 font-semibold"
        >
          <PlusIcon className="w-5 h-5" /> 追加
        </button>
      </header>

      <div className="px-4">
        <div className="bg-ink-100 rounded-full p-1 grid grid-cols-2 text-sm">
          {[
            { k: "month" as const, l: "今月分" },
            { k: "year"  as const, l: "年間・月割り" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`py-2 rounded-full font-semibold transition ${
                tab === t.k ? "bg-brand-500 text-white shadow" : "text-ink-700"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>

        <ul className="mt-3 bg-white rounded-2xl shadow-sm divide-y divide-ink-100">
          {db.fixedCosts
            .filter((f) => (tab === "year" ? f.yearly : true))
            .map((f) => (
              <FixedRow
                key={f.id}
                cost={f}
                paid={f.paidMonths.includes(month)}
                onToggle={() => toggleFixedPaid(f.id, month)}
                onRemove={() => removeFixedCost(f.id)}
              />
            ))}
        </ul>

        {/* 合計 */}
        <div className="mt-3 bg-brand-50 rounded-2xl py-4 text-center">
          <div className="text-sm text-ink-700">今月の固定費合計</div>
          <div className="mt-1 text-2xl font-bold text-brand-600 tabular-nums">
            {total.toLocaleString("ja-JP")} <span className="text-base">円</span>
          </div>
        </div>
      </div>

      {adding && <AddSheet onClose={() => setAdding(false)} onAdd={(f) => { addFixedCost(f); setAdding(false); }} />}
    </div>
  );
}

function FixedRow({
  cost, paid, onToggle, onRemove,
}: {
  cost: FixedCost;
  paid: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="px-4 py-3 flex items-center gap-3">
      <button
        onClick={onToggle}
        aria-label={paid ? "支払済を取消" : "支払済にする"}
        className={`w-6 h-6 rounded-md flex items-center justify-center border ${
          paid ? "bg-brand-500 border-brand-500 text-white" : "bg-white border-ink-300"
        }`}
      >
        {paid && <CheckIcon className="w-4 h-4" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="text-[15px] text-ink-900 truncate">{cost.name}</div>
        <div className="text-xs text-ink-500">
          {cost.yearly ? "毎月（年税月割り）" : `毎月${cost.payDay}日`}
        </div>
      </div>

      <div className="text-right">
        <div className="tabular-nums font-semibold text-ink-900">
          {cost.amount.toLocaleString("ja-JP")}<span className="text-xs ml-0.5">円</span>
        </div>
        <button
          onDoubleClick={onRemove}
          className={`mt-1 inline-block text-[11px] px-2 py-0.5 rounded-full ${
            paid ? "bg-brand-50 text-brand-600" : "bg-amber-50 text-amber-600"
          }`}
          title="ダブルクリックで削除"
        >
          {paid ? "支払済" : "未払い"}
        </button>
      </div>
    </li>
  );
}

function AddSheet({ onClose, onAdd }: { onClose: () => void; onAdd: (f: Omit<FixedCost, "id" | "paidMonths">) => void }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [payDay, setPayDay] = useState<number>(27);
  const [yearly, setYearly] = useState(false);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-[420px] bg-white rounded-t-3xl p-5 pb-8" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-semibold text-ink-900 mb-4">固定費を追加</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前（例：住宅ローン）"
          className="w-full bg-bg rounded-xl border border-ink-100 h-12 px-3 outline-none mb-3"
        />
        <input
          type="number"
          value={amount || ""}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="金額（円）"
          className="w-full bg-bg rounded-xl border border-ink-100 h-12 px-3 outline-none mb-3 tabular-nums"
        />
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            min={1} max={31}
            value={payDay}
            onChange={(e) => setPayDay(Number(e.target.value))}
            className="flex-1 bg-bg rounded-xl border border-ink-100 h-12 px-3 outline-none tabular-nums"
          />
          <span className="self-center text-ink-700">日</span>
        </div>
        <label className="flex items-center gap-2 mb-4 text-sm text-ink-700">
          <input type="checkbox" checked={yearly} onChange={(e) => setYearly(e.target.checked)} />
          年税の月割り
        </label>
        <button
          disabled={!name || !amount}
          onClick={() => onAdd({ name, amount, payDay, yearly })}
          className="w-full h-12 rounded-2xl bg-brand-500 text-white font-bold disabled:opacity-50"
        >
          追加
        </button>
        <button onClick={onClose} className="w-full h-10 mt-2 rounded-2xl text-ink-700">
          キャンセル
        </button>
      </div>
    </div>
  );
}
