import type { DB, FixedCost, Transaction } from "./types";

export const yen = (n: number) =>
  `${n < 0 ? "-" : ""}${Math.abs(Math.round(n)).toLocaleString("ja-JP")}円`;

export const yenShort = (n: number) =>
  `${Math.round(n).toLocaleString("ja-JP")}`;

export function monthKey(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function inMonth(t: { date: string }, month: string) {
  return t.date.startsWith(month);
}

export function daysInMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export function daysRemainingInMonth(month: string, today: Date) {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  if (
    today.getFullYear() !== y ||
    today.getMonth() + 1 !== m
  ) {
    // 今月でない場合はその月の日数
    return last;
  }
  return Math.max(1, last - today.getDate() + 1);
}

export interface MonthSummary {
  income: number;          // 実績収入
  incomeForecast: number;  // 収入予定（settings or 実績）
  fixed: number;           // 固定費合計（月分）
  fixedPaid: number;       // 既に支払済の固定費
  living: number;          // 変動費（生活費）
  business: number;        // 事業費
  tax: number;             // 税金・保険積立
  apportion: number;       // 按分扱い
  expense: number;         // 支出合計（固定費除く・実績）
  remaining: number;       // 残り（予想）= 収入予定 - 固定費 - 生活費 - 事業費 - 税金積立
  usableNow: number;       // 今と使えるお金 = 収入実績 - 既支払（固定費含む）支出
  daily: number;           // 1日あたりの目安
}

export function summarize(db: DB, month: string, today = new Date()): MonthSummary {
  const txs = db.transactions.filter((t) => inMonth(t, month));
  const income = sum(txs.filter((t) => t.type === "income"), (t) => t.amount);
  const expenses = txs.filter((t) => t.type === "expense");
  const living   = sum(expenses.filter((t) => t.kind === "living"),    (t) => t.amount);
  const business = sum(expenses.filter((t) => t.kind === "business"),  (t) => t.amount);
  const apportion = sum(expenses.filter((t) => t.kind === "apportion"), (t) => t.amount);
  const taxTx    = sum(expenses.filter((t) => t.kind === "tax"),       (t) => t.amount);
  const fixedTx  = sum(expenses.filter((t) => t.kind === "fixed"),     (t) => t.amount);
  const expense  = living + business + apportion + taxTx + fixedTx;

  const fixed = sum(db.fixedCosts, (f) => f.amount);
  const fixedPaid = sum(db.fixedCosts.filter((f) => f.paidMonths.includes(month)), (f) => f.amount);

  const incomeForecast = Math.max(income, db.settings.monthlyIncomeForecast);
  const tax = Math.max(taxTx, db.settings.taxReserveMonthly);

  const remaining = incomeForecast - fixed - living - business - tax;
  const usableNow = income - fixedPaid - living - business - apportion - taxTx;
  const days = daysRemainingInMonth(month, today);
  const daily = Math.max(0, Math.floor(usableNow / days));

  return {
    income, incomeForecast,
    fixed, fixedPaid,
    living, business, tax, apportion,
    expense, remaining, usableNow, daily,
  };
}

export function sum<T>(arr: T[], f: (t: T) => number) {
  return arr.reduce((a, b) => a + f(b), 0);
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  ratio: number;    // 0..1
}

export function breakdownByCategory(
  txs: Transaction[],
  filter: (t: Transaction) => boolean,
  topN = 5,
): { items: CategoryBreakdown[]; total: number } {
  const filtered = txs.filter(filter);
  const total = sum(filtered, (t) => t.amount);
  const map = new Map<string, number>();
  for (const t of filtered) map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  const sorted = [...map.entries()]
    .map(([category, amount]) => ({ category, amount, ratio: total ? amount / total : 0 }))
    .sort((a, b) => b.amount - a.amount);
  if (sorted.length <= topN) return { items: sorted, total };
  const top = sorted.slice(0, topN - 1);
  const rest = sorted.slice(topN - 1);
  const restAmount = sum(rest, (t) => t.amount);
  top.push({ category: "その他", amount: restAmount, ratio: total ? restAmount / total : 0 });
  return { items: top, total };
}

export function fixedTotalForMonth(db: DB, month: string) {
  return sum(db.fixedCosts, (f) => f.amount);
}

export function isFixedPaid(f: FixedCost, month: string) {
  return f.paidMonths.includes(month);
}

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function formatJPDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}`;
}

export function formatMD(iso: string) {
  const [, m, d] = iso.split("-").map(Number);
  return `${m}/${d}`;
}

export function jpWeekday(iso: string) {
  const dt = new Date(iso);
  return ["日", "月", "火", "水", "木", "金", "土"][dt.getDay()];
}
