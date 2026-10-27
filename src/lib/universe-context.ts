import { createContext, useContext } from "react";
import type { FormName } from "./universe";

export interface UniverseContextValue {
  morphTo: (form: FormName) => void;
  ready: (form: FormName) => boolean;
  current: FormName | null;
}

const UniverseContext = createContext<UniverseContextValue | null>(null);

export const useUniverse = (): UniverseContextValue => {
  const ctx = useContext(UniverseContext);
  if (!ctx) throw new Error("useUniverse must be used within UniverseProvider");
  return ctx;
};

export { UniverseContext };
