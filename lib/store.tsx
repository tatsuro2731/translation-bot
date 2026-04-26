"use client";

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";
import type { DB, FixedCost, Settings, Transaction } from "./types";
import { seedDB } from "./seed";

const KEY = "atoikura.db.v1";

function load(): DB {
  if (typeof window === "undefined") return seedDB;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seedDB;
    return JSON.parse(raw) as DB;
  } catch {
    return seedDB;
  }
}

function save(db: DB) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    // ignore
  }
}

interface Ctx {
  db: DB;
  hydrated: boolean;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  toggleFixedPaid: (id: string, month: string) => void;
  addFixedCost: (f: Omit<FixedCost, "id" | "paidMonths">) => void;
  removeFixedCost: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetToSeed: () => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(seedDB);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDb(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) save(db);
  }, [db, hydrated]);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setDb((d) => ({
      ...d,
      transactions: [{ ...t, id: crypto.randomUUID() }, ...d.transactions],
    }));
  }, []);

  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => {
    setDb((d) => ({
      ...d,
      transactions: d.transactions.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }, []);

  const removeTransaction = useCallback((id: string) => {
    setDb((d) => ({ ...d, transactions: d.transactions.filter((x) => x.id !== id) }));
  }, []);

  const toggleFixedPaid = useCallback((id: string, month: string) => {
    setDb((d) => ({
      ...d,
      fixedCosts: d.fixedCosts.map((f) => {
        if (f.id !== id) return f;
        const has = f.paidMonths.includes(month);
        return {
          ...f,
          paidMonths: has ? f.paidMonths.filter((m) => m !== month) : [...f.paidMonths, month],
        };
      }),
    }));
  }, []);

  const addFixedCost = useCallback((f: Omit<FixedCost, "id" | "paidMonths">) => {
    setDb((d) => ({
      ...d,
      fixedCosts: [...d.fixedCosts, { ...f, id: crypto.randomUUID(), paidMonths: [] }],
    }));
  }, []);

  const removeFixedCost = useCallback((id: string) => {
    setDb((d) => ({ ...d, fixedCosts: d.fixedCosts.filter((f) => f.id !== id) }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setDb((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  const resetToSeed = useCallback(() => setDb(seedDB), []);

  const value = useMemo<Ctx>(() => ({
    db, hydrated,
    addTransaction, updateTransaction, removeTransaction,
    toggleFixedPaid, addFixedCost, removeFixedCost,
    updateSettings, resetToSeed,
  }), [db, hydrated, addTransaction, updateTransaction, removeTransaction, toggleFixedPaid, addFixedCost, removeFixedCost, updateSettings, resetToSeed]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): Ctx {
  const v = useContext(StoreCtx);
  if (!v) throw new Error("useStore must be used inside StoreProvider");
  return v;
}
