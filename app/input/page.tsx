"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import {
  BUSINESS_CATEGORIES,
  ExpenseKind, INCOME_CATEGORIES, KIND_LABEL, LIVING_CATEGORIES,
  PaymentMethod, PAYMENT_LABEL, TxType,
} from "@/lib/types";
import { todayISO } from "@/lib/calc";
import { CalcIcon, CalendarIcon, ChevronRight, CloseIcon } from "@/components/icons";

const TYPE_TABS: { key: TxType; label: string }[] = [
  { key: "expense",  label: "支出" },
  { key: "income",   label: "収入" },
  { key: "transfer", label: "振替" },
];

const KIND_ORDER: ExpenseKind[] = ["living", "business", "fixed", "tax", "apportion"];
const PAYMENTS: PaymentMethod[] = ["cash", "card", "account", "emoney"];

export default function InputPage() {
  const router = useRouter();
  const { addTransaction } = useStore();

  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState<number>(1280);
  const [kind, setKind] = useState<ExpenseKind>("living");
  const [category, setCategory] = useState<string>("食費");
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [date, setDate] = useState<string>("2024-04-26");
  const [memo, setMemo] = useState<string>("");
  const [fromKind, setFromKind] = useState<ExpenseKind>("living");
  const [toKind, setToKind] = useState<ExpenseKind>("business");

  const categories =
    type === "income"
      ? INCOME_CATEGORIES
      : kind === "business"
      ? BUSINESS_CATEGORIES
      : LIVING_CATEGORIES;

  function save() {
    if (!amount || amount <= 0) return;
    if (type === "transfer") {
      addTransaction({
        type: "transfer",
        category: `${KIND_LABEL[fromKind]} → ${KIND_LABEL[toKind]}`,
        amount, paymentMethod: payment, date, memo,
        fromKind, toKind,
      });
    } else if (type === "income") {
      addTransaction({
        type: "income", category, amount, paymentMethod: payment, date, memo,
      });
    } else {
      addTransaction({
        type: "expense", kind, category, amount, paymentMethod: payment, date, memo,
      });
    }
    router.push("/history");
  }

  return (
    <div className="min-h-[100svh] bg-bg" style={{ paddingBottom: "calc(96px + var(--safe-bottom))" }}>
      <div className="statusbar" />
      <header className="px-4 pt-2 pb-3 flex items-center">
        <Link href="/home" aria-label="閉じる" className="text-ink-700">
          <CloseIcon className="w-6 h-6" />
        </Link>
        <h1 className="flex-1 text-center font-semibold text-ink-900">
          {type === "expense" ? "支出の入力" : type === "income" ? "収入の入力" : "振替の入力"}
        </h1>
        <span className="w-6" />
      </header>

      {/* タブ */}
      <div className="mx-4 bg-ink-100 rounded-full p-1 grid grid-cols-3 text-sm">
        {TYPE_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setType(t.key)}
            className={`py-2 rounded-full font-semibold transition ${
              type === t.key ? "bg-brand-500 text-white shadow" : "text-ink-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {/* 金額 */}
        <Field label="金額">
          <div className="flex items-center bg-white rounded-xl border border-ink-100 px-3 h-14">
            <span className="text-ink-700 mr-2">¥</span>
            <input
              type="number"
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="flex-1 text-right text-2xl font-bold tabular-nums bg-transparent outline-none"
              placeholder="0"
            />
            <span className="ml-1 text-ink-700">円</span>
            <button className="ml-2 text-ink-300" aria-label="電卓"><CalcIcon className="w-6 h-6" /></button>
          </div>
        </Field>

        {/* これは？ (支出のみ) */}
        {type === "expense" && (
          <Field label="これは？">
            <div className="flex flex-wrap gap-2">
              {KIND_ORDER.map((k) => (
                <Chip key={k} active={kind === k} onClick={() => {
                  setKind(k);
                  setCategory(k === "business" ? BUSINESS_CATEGORIES[0] : LIVING_CATEGORIES[0]);
                }}>{KIND_LABEL[k]}</Chip>
              ))}
            </div>
          </Field>
        )}

        {/* 振替 from→to */}
        {type === "transfer" && (
          <Field label="振替">
            <div className="grid grid-cols-2 gap-2">
              <KindSelect label="From" value={fromKind} onChange={setFromKind} />
              <KindSelect label="To"   value={toKind}   onChange={setToKind} />
            </div>
          </Field>
        )}

        {/* カテゴリ */}
        {type !== "transfer" && (
          <Field label="種類（カテゴリ）">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white rounded-xl border border-ink-100 h-12 px-3 outline-none appearance-none text-[15px]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7568' stroke-width='1.8'><path stroke-linecap='round' stroke-linejoin='round' d='m9 6 6 6-6 6'/></svg>\")",
                backgroundPosition: "right 12px center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "20px",
                paddingRight: "40px",
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        )}

        {/* 支払い方法 */}
        <Field label="支払い方法">
          <div className="flex flex-wrap gap-2">
            {PAYMENTS.map((p) => (
              <Chip key={p} active={payment === p} onClick={() => setPayment(p)}>
                {PAYMENT_LABEL[p]}
              </Chip>
            ))}
          </div>
        </Field>

        {/* 日付 */}
        <Field label="日付">
          <label className="flex items-center bg-white rounded-xl border border-ink-100 h-12 px-3 gap-2 text-[15px]">
            <CalendarIcon className="w-5 h-5 text-ink-500 ml-auto" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent outline-none text-right tabular-nums"
            />
          </label>
        </Field>

        {/* メモ */}
        <Field label="メモ（任意）">
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full bg-white rounded-xl border border-ink-100 h-12 px-3 outline-none text-[15px]"
            placeholder="例：スーパーで買い物"
          />
        </Field>
      </div>

      {/* 保存ボタン */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] p-4 bg-bg/95 backdrop-blur border-t border-ink-100"
        style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}
      >
        <button
          onClick={save}
          className="w-full h-14 rounded-2xl bg-brand-500 text-white text-base font-bold active:bg-brand-600"
        >
          保存
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <div className="text-sm text-ink-700 mb-2">{label}</div>
      {children}
    </section>
  );
}

function Chip({
  children, active, onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 h-10 rounded-full border text-sm font-semibold ${
        active
          ? "bg-brand-50 border-brand-500 text-brand-600"
          : "bg-white border-ink-100 text-ink-700"
      }`}
    >
      {children}
    </button>
  );
}

function KindSelect({
  label, value, onChange,
}: {
  label: string;
  value: ExpenseKind;
  onChange: (v: ExpenseKind) => void;
}) {
  return (
    <label className="bg-white rounded-xl border border-ink-100 h-12 px-3 flex items-center gap-2">
      <span className="text-xs text-ink-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ExpenseKind)}
        className="flex-1 bg-transparent outline-none text-[15px] text-right"
      >
        {KIND_ORDER.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
      </select>
      <ChevronRight className="w-4 h-4 text-ink-300" />
    </label>
  );
}
