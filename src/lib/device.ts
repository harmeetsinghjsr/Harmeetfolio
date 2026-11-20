// Small device helpers shared by the motion components.

/** Touch-first device (phones, tablets): no hover, coarse pointer. */
export function isTouchDevice() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none), (pointer: coarse)").matches
  );
}

/** True when the device can comfortably run the WebGL hero scene. */
export function canRunHeavyScene() {
  if (typeof navigator === "undefined") return false;
  const n = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (n.connection?.saveData) return false;
  if ((n.deviceMemory ?? 4) < 4) return false;
  if ((n.hardwareConcurrency ?? 4) < 4) return false;
  return true;
}

/** Calls `cb` at most once per animation frame while the page scrolls. */
export function onScrollFrame(cb: () => void) {
  let raf = 0;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      cb();
    });
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  schedule();
  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    cancelAnimationFrame(raf);
  };
}
