"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { todayISO } from "@/lib/calc";
import { CloseIcon, QuestionIcon, RefreshIcon } from "@/components/icons";

export default function CashPage() {
  const router = useRouter();
  const { db, hydrated, addTransaction, updateSettings } = useStore();
  const [actual, setActual] = useState<number>(42_000);

  if (!hydrated) return null;

  const app = db.settings.appCashBalance;
  const diff = actual - app;

  function reconcile() {
    if (diff === 0) {
      router.push("/home");
      return;
    }
    addTransaction({
      type: "expense",
      kind: "living",
      category: "現金調整",
      amount: Math.abs(diff),
      paymentMethod: "cash",
      date: todayISO(),
      memo: diff < 0 ? "生活費として振替" : "現金過剰の調整",
    });
    updateSettings({ appCashBalance: actual });
    router.push("/home");
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="statusbar" />
      <header className="px-4 pt-2 pb-3 flex items-center">
        <Link href="/home" className="text-ink-700"><CloseIcon className="w-6 h-6" /></Link>
        <h1 className="flex-1 text-center font-semibold text-ink-900">現金残高</h1>
        <button className="text-ink-500" aria-label="再計算"><RefreshIcon className="w-5 h-5" /></button>
      </header>

      <div className="px-4 space-y-3">
        <section className="bg-brand-50 rounded-2xl p-5 text-center">
          <div className="text-sm text-ink-700">アプリ上の現金残高</div>
          <div className="mt-1 text-3xl font-bold text-ink-900 tabular-nums">
            {app.toLocaleString("ja-JP")} <span className="text-base">円</span>
          </div>
        </section>

        <section className="bg-bg-danger rounded-2xl p-5 text-center">
          <div className="text-sm text-ink-700">実際の現金残高を入力</div>
          <input
            type="number"
            value={actual || ""}
            onChange={(e) => setActual(Number(e.target.value))}
            className="mt-1 w-full text-center text-3xl font-bold tabular-nums bg-transparent outline-none"
            placeholder="0"
          />
          <div className="text-base text-ink-700">円</div>
        </section>

        <section className="rounded-2xl text-center py-3">
          <div className="text-sm text-ink-700">差額</div>
          <div className={`text-3xl font-bold tabular-nums ${diff < 0 ? "text-red-500" : diff > 0 ? "text-brand-500" : "text-ink-700"}`}>
            {diff > 0 ? "+" : ""}{diff.toLocaleString("ja-JP")} <span className="text-base">円</span>
          </div>
        </section>

        {diff !== 0 && (
          <section className="bg-bg-warn rounded-2xl p-4">
            <div className="text-[13px] text-ink-700 mb-3">
              {diff < 0
                ? "生活費として使った可能性があります 振替処理しますか？"
                : "現金が増えています。収入として記録しますか？"}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={reconcile}
                className="h-12 rounded-xl bg-brand-500 text-white font-semibold"
              >
                振替する
              </button>
              <button
                onClick={() => router.push("/home")}
                className="h-12 rounded-xl bg-white text-ink-700 font-semibold border border-ink-100"
              >
                あとで
              </button>
            </div>
          </section>
        )}

        <button className="mx-auto flex items-center gap-1 text-ink-500 text-sm">
          <QuestionIcon className="w-4 h-4" /> 現金残高のズレについて？
        </button>
      </div>
    </div>
  );
}

