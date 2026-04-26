export type TxType = "expense" | "income" | "transfer";

export type ExpenseKind =
  | "living"        // 生活費
  | "business"      // 事業費
  | "fixed"         // 固定費
  | "tax"           // 税金・保険積立
  | "apportion";    // 按分（生活/事業の按分）

export type PaymentMethod = "cash" | "card" | "account" | "emoney";

export type IncomeSource = "uber" | "demaekan" | "other";

export interface Transaction {
  id: string;
  type: TxType;
  kind?: ExpenseKind;          // expense のときのみ
  category: string;            // 食費 / ガソリン / Uber売上 etc.
  amount: number;              // 円
  paymentMethod: PaymentMethod;
  date: string;                // ISO yyyy-mm-dd
  memo?: string;
  // 収入の補助情報
  workCount?: number;          // 件数
  workMinutes?: number;        // 作業時間（分）
  // 振替
  fromKind?: ExpenseKind;
  toKind?: ExpenseKind;
}

export interface FixedCost {
  id: string;
  name: string;
  amount: number;              // 月額
  payDay: number;              // 毎月の支払日
  yearly?: boolean;            // 年税の月割りなど
  paidMonths: string[];        // ["2024-04", ...]
}

export interface Settings {
  monthlyIncomeForecast: number;
  taxReserveMonthly: number;
  appCashBalance: number;      // アプリ上の現金残高
}

export interface DB {
  transactions: Transaction[];
  fixedCosts: FixedCost[];
  settings: Settings;
}

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: "現金",
  card: "クレカ",
  account: "口座",
  emoney: "電子マネー",
};

export const KIND_LABEL: Record<ExpenseKind, string> = {
  living: "生活費",
  business: "事業費",
  fixed: "固定費",
  tax: "税金",
  apportion: "按分",
};

export const LIVING_CATEGORIES = [
  "食費", "ガソリン", "日用品", "医療", "交通", "通信", "娯楽", "衣服", "その他",
];
export const BUSINESS_CATEGORIES = [
  "ガソリン", "通信", "消耗品", "外注費", "交通", "広告", "その他",
];
export const INCOME_CATEGORIES = [
  "Uber売上", "出前館売上", "売上（その他）", "給与", "雑収入",
];
