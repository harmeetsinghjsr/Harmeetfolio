import { useEffect, useState } from "react";

// Site-wide "reduce motion": OS preference OR the footer toggle (saved in localStorage).
const KEY = "reduce-motion";
const subs = new Set<(v: boolean) => void>();
let user: boolean | null = null;

function os() { return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
function stored() {
  if (user !== null) return user;
  try { const v = localStorage.getItem(KEY); user = v === null ? null : v === "1"; } catch { /* ignore */ }
  return user;
}
export function isReduced() { return stored() ?? os(); }
export function setReduced(v: boolean) {
  user = v;
  try { localStorage.setItem(KEY, v ? "1" : "0"); } catch { /* ignore */ }
  document.documentElement.classList.toggle("reduce-motion", v);
  subs.forEach((f) => f(v));
}
export function useReduced() {
  const [v, setV] = useState(false);
  useEffect(() => {
    const cur = isReduced();
    setV(cur);
    document.documentElement.classList.toggle("reduce-motion", cur);
    subs.add(setV);
    return () => { subs.delete(setV); };
  }, []);
  return v;
}
