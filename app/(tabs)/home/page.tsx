"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { summarize, yen } from "@/lib/calc";
import { DEFAULT_TODAY, monthLabelShort, useMonth } from "@/lib/useMonth";
import { BellIcon, ChevronDown, ChevronRight, MenuIcon, QuestionIcon, WarnIcon } from "@/components/icons";

export default function HomePage() {
  const { db, hydrated } = useStore();
  const { month, shift } = useMonth();

  const s = useMemo(() => summarize(db, month, DEFAULT_TODAY), [db, month]);
  const cashGap = db.settings.appCashBalance - 42_000; // demo: 実際残高は cash 画面で入力するが初期は44,200円ズレ
  const fixedUnpaidCount = db.fixedCosts.filter((f) => !f.paidMonths.includes(month)).length;

  if (!hydrated) {
    return <div className="p-6 text-ink-500">読み込み中…</div>;
  }

  return (
    <div className="bg-bg min-h-screen">
      <div className="statusbar" />
      {/* ヘッダー */}
      <header className="px-4 pt-2 pb-3 flex items-center justify-between">
        <button
          onClick={() => shift(-1)}
          className="flex items-center gap-1 text-ink-900 text-lg font-semibold"
        >
          {monthLabelShort(month)} <ChevronDown className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 text-ink-700">
          <button aria-label="通知"><BellIcon className="w-6 h-6" /></button>
          <button aria-label="メニュー"><MenuIcon className="w-6 h-6" /></button>
        </div>
      </header>

      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-base font-semibold text-ink-900">今月のあといくら</h1>
          <button aria-label="ヘルプ" className="text-ink-300"><QuestionIcon className="w-5 h-5" /></button>
        </div>

        {/* ヒーローカード */}
        <section className="bg-brand-500 text-white rounded-2xl p-5 shadow-sm">
          <div className="text-sm opacity-90">今と使えるお金</div>
          <div className="mt-1 text-[40px] leading-none font-bold tracking-tight">
            {Math.round(s.usableNow).toLocaleString("ja-JP")}<span className="text-2xl ml-1 font-bold">円</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs opacity-90">
            <span>今日使える目安</span>
            <span><b className="text-base">{s.daily.toLocaleString("ja-JP")}</b>円/日</span>
          </div>
        </section>

        {/* 内訳カード */}
        <section className="bg-white rounded-2xl mt-3 px-4 py-2 shadow-sm divide-y divide-ink-100">
          <Row label="収入予定" value={yen(s.incomeForecast)} />
          <Row label="固定費"   value={yen(s.fixed)} />
          <Row label="変動費（生活費）" value={yen(s.living)} />
          <Row label="事業費"   value={yen(s.business)} />
          <Row label="税金・保険積立" value={yen(s.tax)} />
          <Row label="残り（予想）" value={yen(s.remaining)} highlight />
        </section>

        {/* 現金ズレカード */}
        <Link
          href="/cash"
          className="mt-3 block bg-bg-warn rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 font-semibold text-ink-900">
            <WarnIcon className="w-5 h-5 text-amber-500" />
            <span>現金のズレがあります</span>
            <ChevronRight className="ml-auto w-5 h-5 text-ink-300" />
          </div>
          <div className="mt-2 text-sm text-ink-700 grid grid-cols-2 gap-y-1">
            <span>アプリ上の現金残高</span>
            <span className="text-right text-ink-900">{yen(db.settings.appCashBalance)}</span>
            <span>実際の現金残高</span>
            <span className="text-right text-ink-900">{yen(42_000)}</span>
            <span>差額</span>
            <span className="text-right font-semibold text-red-500">{yen(-cashGap)}</span>
          </div>
        </Link>

        {/* やることリスト */}
        <section className="mt-3 bg-white rounded-2xl p-4 shadow-sm">
          <div className="text-sm text-ink-500 mb-2">やることリスト</div>
          <Link href="/fixed" className="flex items-center justify-between text-ink-900">
            <span className="text-[15px]">
              {fixedUnpaidCount > 0 ? "固定費の支払いを確認しましょう" : "今月の固定費は完了済みです"}
            </span>
            <ChevronRight className="w-5 h-5 text-ink-300" />
          </Link>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className={`text-[15px] ${highlight ? "font-semibold text-ink-900" : "text-ink-700"}`}>{label}</span>
      <span className={`text-[15px] tabular-nums ${highlight ? "font-bold text-brand-500" : "text-ink-900"}`}>{value}</span>
    </div>
  );
}
