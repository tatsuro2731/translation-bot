"use client";

import { useState, useCallback } from "react";

// スクリーンショットに合わせて 2024-04 を初期表示にする
export const DEFAULT_MONTH = "2024-04";
export const DEFAULT_TODAY = new Date("2024-04-26T09:41:00+09:00");

export function useMonth(initial = DEFAULT_MONTH) {
  const [month, setMonth] = useState(initial);

  const shift = useCallback((delta: number) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }, [month]);

  return { month, setMonth, shift };
}

export function monthLabelShort(month: string) {
  const [, m] = month.split("-").map(Number);
  return `${m}月`;
}

export function monthLabelLong(month: string) {
  const [y, m] = month.split("-").map(Number);
  return `${y}年${m}月`;
}
