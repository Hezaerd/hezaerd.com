import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type OperatorChromeOverrides = {
  headerStart?: ReactNode;
  headerEnd?: ReactNode;
  subHeader?: ReactNode;
  /** `null` hides the centered title; omit to keep the route default. */
  headerTitle?: string | null;
};

type OperatorChromeContextValue = {
  overrides: OperatorChromeOverrides;
  setOverrides: (overrides: OperatorChromeOverrides) => void;
};

const OperatorChromeContext = createContext<OperatorChromeContextValue | null>(null);

export function OperatorChromeProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<OperatorChromeOverrides>({});

  const value = useMemo(
    () => ({
      overrides,
      setOverrides,
    }),
    [overrides],
  );

  return <OperatorChromeContext.Provider value={value}>{children}</OperatorChromeContext.Provider>;
}

export function useOperatorChromeOverrides() {
  const context = useContext(OperatorChromeContext);
  if (!context) {
    throw new Error("useOperatorChromeOverrides must be used within OperatorChromeProvider");
  }
  return context.overrides;
}

export function useSetOperatorChromeOverrides() {
  const context = useContext(OperatorChromeContext);
  if (!context) {
    throw new Error("useSetOperatorChromeOverrides must be used within OperatorChromeProvider");
  }
  return context.setOverrides;
}

/** Registers header / sub-header slots for the current route subtree. */
export function OperatorChrome(overrides: OperatorChromeOverrides) {
  const setOverrides = useSetOperatorChromeOverrides();

  useLayoutEffect(() => {
    setOverrides(overrides);
    return () => setOverrides({});
  }, [overrides.headerStart, overrides.headerEnd, overrides.subHeader, overrides.headerTitle, setOverrides]);

  return null;
}
