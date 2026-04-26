import type { DB } from "./types";

// スクリーンショットに合わせた初期データ（2024-04 を「今月」として再現）
export const seedDB: DB = {
  settings: {
    monthlyIncomeForecast: 500_000,
    taxReserveMonthly: 50_000,
    appCashBalance: 86_200,
  },
  fixedCosts: [
    { id: "f1", name: "住宅ローン",          amount: 89_341, payDay: 27,  paidMonths: ["2024-04"] },
    { id: "f2", name: "管理費・修繕積立金",   amount: 25_430, payDay: 27,  paidMonths: ["2024-04"] },
    { id: "f3", name: "国民健康保険",         amount: 56_780, payDay: 30,  paidMonths: [] },
    { id: "f4", name: "国民年金",             amount: 16_980, payDay: 30,  paidMonths: ["2024-04"] },
    { id: "f5", name: "固定資産税(年税月割り)", amount: 7_333, payDay: 30, yearly: true, paidMonths: ["2024-04"] },
    { id: "f6", name: "住民税(年税月割り)",   amount: 13_333, payDay: 30, yearly: true, paidMonths: [] },
  ],
  transactions: [
    // 4/26 当日
    { id: "t1",  type: "expense", kind: "living",   category: "食費",      amount:   1_280, paymentMethod: "cash",    date: "2024-04-26", memo: "スーパーで買い物" },
    { id: "t2",  type: "expense", kind: "business", category: "ガソリン",  amount:     950, paymentMethod: "cash",    date: "2024-04-26", memo: "バイク給油" },
    { id: "t3",  type: "income",                    category: "Uber売上",  amount:  12_480, paymentMethod: "account", date: "2024-04-26", workCount: 18, workMinutes: 320 },
    // 4/25
    { id: "t4",  type: "expense", kind: "living",   category: "日用品",    amount:   1_542, paymentMethod: "card",    date: "2024-04-25", memo: "ドラッグストア" },
    { id: "t5",  type: "income",                    category: "出前館売上",amount:   9_230, paymentMethod: "account", date: "2024-04-25", workMinutes: 250 },
    // 月初〜中旬の生活費（分析の比率を再現）
    { id: "t10", type: "expense", kind: "living",   category: "食費",      amount:  56_920, paymentMethod: "card",    date: "2024-04-10" },
    { id: "t11", type: "expense", kind: "living",   category: "ガソリン",  amount:  31_400, paymentMethod: "cash",    date: "2024-04-12" },
    { id: "t12", type: "expense", kind: "living",   category: "日用品",    amount:  17_358, paymentMethod: "card",    date: "2024-04-15" },
    { id: "t13", type: "expense", kind: "living",   category: "医療",      amount:  12_000, paymentMethod: "cash",    date: "2024-04-18" },
    { id: "t14", type: "expense", kind: "living",   category: "その他",    amount:   8_000, paymentMethod: "emoney",  date: "2024-04-20" },
    // 事業費（合計 42,000 になるように）
    { id: "t20", type: "expense", kind: "business", category: "通信",      amount:  18_000, paymentMethod: "card",    date: "2024-04-05" },
    { id: "t21", type: "expense", kind: "business", category: "消耗品",    amount:  13_050, paymentMethod: "card",    date: "2024-04-11" },
    { id: "t22", type: "expense", kind: "business", category: "ガソリン",  amount:  10_000, paymentMethod: "cash",    date: "2024-04-19" },
    // 月初の追加売上（収入予定にカウント）
    { id: "t30", type: "income",                    category: "Uber売上",  amount: 220_000, paymentMethod: "account", date: "2024-04-08", workCount: 320, workMinutes: 4200 },
    { id: "t31", type: "income",                    category: "出前館売上",amount: 120_000, paymentMethod: "account", date: "2024-04-15", workCount: 180, workMinutes: 2400 },
  ],
};
