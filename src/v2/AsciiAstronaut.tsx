import { useEffect, useRef } from "react";

// Your astronaut logo, re-drawn every frame as coloured code glyphs.
// Glyphs scatter away from the pointer (or finger), scramble while disturbed,
// and dissolve upward as the hero scrolls out of view.

const RAMP = " .,:;-=+*cxo#%@";
const CODE = "{}[]<>/\\=;:01+*#$&%";
type Cell = {
  hx: number; // home position
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ch: string;
  base: string;
  bucket: number;
  lum: number;
  heat: number; // how disturbed the cell is (0..1)
  seed: number;
};

export function AsciiAstronaut({ src, reduced }: { src: string; reduced: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const box = host.current;
    if (!el || !box) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    let cells: Cell[] = [];
    let palette: string[] = [];
    let byBucket: Cell[][] = [];
    let size = 0;
    let cellPx = 10;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let disposed = false;
    const pointer = { x: -9999, y: -9999, active: 0, down: 0 };
    let ripple = { x: 0, y: 0, t: -1 };
    let dissolve = 0;

    const img = new Image();
    img.src = src;

    const build = () => {
      const rect = box.getBoundingClientRect();
      size = Math.floor(Math.min(rect.width, rect.height));
      if (size < 40) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cellPx = size < 420 ? 7 : size < 640 ? 8 : 9;
      el.width = size * dpr;
      el.height = size * dpr;
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.floor(size / cellPx);
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = cols;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.drawImage(img, 0, 0, cols, cols);
      const data = octx.getImageData(0, 0, cols, cols).data;

      const buckets = new Map<string, number>();
      palette = [];
      cells = [];
      for (let gy = 0; gy < cols; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const i = (gy * cols + gx) * 4;
          const a = data[i + 3]! / 255;
          if (a < 0.5) continue;
          let r = data[i]!,
            g = data[i + 1]!,
            b = data[i + 2]!;
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          // lift the darks so the figure reads on black (navy suit -> steel blue),
          // keep the logo's orange/blue identity, then quantize for batching
          const lift = 1.05 + (1 - lum) * 0.9;
          r = Math.min(255, r * lift + 38);
          g = Math.min(255, g * lift + 46);
          b = Math.min(255, b * lift + 58);
          const q = (v: number) => Math.round(v / 32) * 32;
          const key = `${q(r)},${q(g)},${q(b)}`;
          let bucket = buckets.get(key);
          if (bucket === undefined) {
            bucket = palette.length;
            buckets.set(key, bucket);
            palette.push(`rgb(${key})`);
          }
          const idx = 4 + Math.floor(lum * (RAMP.length - 4));
          const ch = RAMP[Math.min(RAMP.length - 1, idx)] ?? "+";
          const hx = gx * cellPx + cellPx / 2;
          const hy = gy * cellPx + cellPx / 2;
          cells.push({
            hx,
            hy,
            x: hx,
            y: hy,
            vx: 0,
            vy: 0,
            ch: ch === " " ? "." : ch,
            base: ch === " " ? "." : ch,
            bucket,
            lum,
            heat: 0,
            seed: Math.random() * 1000,
          });
        }
      }
      byBucket = palette.map(() => []);
      for (const c of cells) byBucket[c.bucket]!.push(c);
    };

    const toLocal = (clientX: number, clientY: number) => {
      const r = el.getBoundingClientRect();
      return { x: clientX - r.left, y: clientY - r.top };
    };
    const onMove = (e: PointerEvent) => {
      const p = toLocal(e.clientX, e.clientY);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.active = 1;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const p = toLocal(t.clientX, t.clientY);
      pointer.x = p.x;
      pointer.y = p.y;
      pointer.active = 1;
    };
    const onLeave = () => {
      pointer.active = 0;
    };
    const onDown = (e: PointerEvent) => {
      const p = toLocal(e.clientX, e.clientY);
      ripple = { x: p.x, y: p.y, t: performance.now() };
    };
    const onScroll = () => {
      const r = box.getBoundingClientRect();
      dissolve = Math.max(0, Math.min(1, -r.top / (r.height * 0.9)));
    };

    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || !cells.length) return;
      const dt = Math.min(2, (now - last) / 16.67);
      last = now;
      const t = now / 1000;
      ctx.clearRect(0, 0, size, size);
      ctx.font = `${cellPx + 1}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const R = size * 0.17;
      const rippleAge = ripple.t < 0 ? -1 : (now - ripple.t) / 1000;
      if (rippleAge > 1.6) ripple.t = -1;

      for (const c of cells) {
        let fx = 0,
          fy = 0;
        if (!reduced && pointer.active) {
          const dx = c.x - pointer.x,
            dy = c.y - pointer.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < R) {
            const f = (1 - d / R) ** 2 * 2.4;
            fx += (dx / d) * f;
            fy += (dy / d) * f;
            c.heat = Math.min(1, c.heat + 0.18 * dt);
          }
        }
        if (!reduced && rippleAge >= 0) {
          const dx = c.hx - ripple.x,
            dy = c.hy - ripple.y;
          const d = Math.hypot(dx, dy) || 1;
          const front = rippleAge * size * 0.9;
          const band = Math.abs(d - front);
          if (band < 26) {
            const f = (1 - band / 26) * 3.2 * (1 - rippleAge / 1.6);
            fx += (dx / d) * f;
            fy += (dy / d) * f;
            c.heat = Math.min(1, c.heat + 0.25);
          }
        }
        // idle shimmer: a slow diagonal wave
        const wave = reduced ? 0 : Math.sin(c.hx * 0.025 + c.hy * 0.018 - t * 1.4) * 0.35;
        // dissolve upward on scroll, cells leave in a staggered order
        const lift = reduced
          ? 0
          : Math.max(0, dissolve * 1.6 - (c.seed % 1) * 0.6) * (60 + (c.seed % 140));
        const tx = c.hx + Math.sin(c.seed + t * 0.6) * lift * 0.12;
        const ty = c.hy + wave - lift;

        c.vx += (fx + (tx - c.x) * 0.06) * dt;
        c.vy += (fy + (ty - c.y) * 0.06) * dt;
        c.vx *= 0.82;
        c.vy *= 0.82;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.heat *= 0.965;

        if (c.heat > 0.12 && Math.random() < c.heat * 0.5) {
          c.ch = CODE[Math.floor(Math.random() * CODE.length)] ?? "#";
        } else if (c.heat < 0.05) {
          c.ch = c.base;
        }
      }

      const alpha = 1 - dissolve * 0.85;
      for (let b = 0; b < byBucket.length; b++) {
        const list = byBucket[b]!;
        if (!list.length) continue;
        ctx.fillStyle = palette[b]!;
        ctx.globalAlpha = alpha;
        for (const c of list) {
          if (c.heat > 0.35) continue; // hot cells drawn in accent below
          ctx.fillText(c.ch, c.x, c.y);
        }
      }
      // disturbed glyphs glow in the logo's orange
      ctx.fillStyle = "#ff6a2b";
      for (const c of cells) {
        if (c.heat <= 0.35) continue;
        ctx.globalAlpha = alpha * Math.min(1, c.heat * 1.4);
        ctx.fillText(c.ch, c.x, c.y);
      }
      ctx.globalAlpha = 1;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    io.observe(box);
    const ro = new ResizeObserver(() => {
      if (img.complete) build();
    });
    ro.observe(box);

    img.onload = () => {
      if (disposed) return;
      build();
      // entrance: glyphs fall into place from scattered positions
      if (!reduced) {
        for (const c of cells) {
          c.x = c.hx + (Math.random() - 0.5) * size * 0.9;
          c.y = c.hy + (Math.random() - 0.5) * size * 0.9;
          c.heat = 0.6;
        }
      }
      raf = requestAnimationFrame(frame);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onLeave, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onLeave);
      document.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [src, reduced]);

  return (
    <div ref={host} className="v2-ascii" aria-hidden>
      <canvas ref={canvas} />
    </div>
  );
}
