"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Slot = ReactNode | null;

interface Ctx {
  slot: Slot;
  setSlot: (s: Slot) => void;
}

const PageActionsContext = createContext<Ctx | null>(null);

export function PageActionsProvider({ children }: { children: ReactNode }) {
  const [slot, setSlotState] = useState<Slot>(null);
  const setSlot = useCallback((s: Slot) => setSlotState(s), []);
  const value = useMemo(() => ({ slot, setSlot }), [slot, setSlot]);
  return (
    <PageActionsContext.Provider value={value}>
      {children}
    </PageActionsContext.Provider>
  );
}

export function usePageActionsSlot() {
  const ctx = useContext(PageActionsContext);
  if (!ctx)
    throw new Error("usePageActionsSlot must be used within PageActionsProvider");
  return ctx;
}

// Helper component pages can render to register topbar CTAs.
export function PageActions({ children }: { children: ReactNode }) {
  const { setSlot } = usePageActionsSlot();
  // One-time registration on mount via a ref to avoid re-runs on parent re-renders.
  const registered = useRef(false);
  if (!registered.current) {
    setSlot(children);
    registered.current = true;
  }
  return null;
}
