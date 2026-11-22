import { useEffect, useRef } from "react";

// A picture (your portrait), re-drawn every frame as coloured code glyphs.
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

export function AsciiPortrait({
  src,
  revealSrc,
  reduced,
}: {
  src: string;
  revealSrc?: string;
  reduced: boolean;
}) {
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
    let size = 0; // drawing height; also the scale for interaction radii
    let W = 0;
    let H = 0;
    let cellPx = 10;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let disposed = false;
    const pointer = { x: -9999, y: -9999, active: 0, down: 0 };
    let ripple = { x: 0, y: 0, t: -1 };
    let dissolve = 0;
    // x-ray lens: follows the pointer smoothly and opens only over the portrait
    const lens = { x: 0, y: 0, k: 0 };
    // tap / click: the full photo opens from the tap point, holds, then re-codes
    let reveal = { x: 0, y: 0, t: -1 };
    const OPEN = 0.7,
      HOLD = 2.6,
      CLOSE = 0.8;

    const img = new Image();
    img.src = src;
    // sharper image for the lens and the full reveal (falls back to the glyph source)
    const photo = new Image();
    photo.src = revealSrc ?? src;
    const sharp = () => (photo.complete && photo.naturalWidth > 0 ? photo : img);

    const build = () => {
      const rect = box.getBoundingClientRect();
      const fit = Math.floor(Math.min(rect.width, rect.height));
      if (fit < 40) return;
      // keep the picture's own aspect ratio inside the square box
      const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
      H = aspect <= 1 ? fit : Math.floor(fit / aspect);
      W = aspect <= 1 ? Math.floor(fit * aspect) : fit;
      size = H;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cellPx = fit < 420 ? 5 : fit < 640 ? 6 : 7;
      el.width = W * dpr;
      el.height = H * dpr;
      el.style.width = `${W}px`;
      el.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.floor(W / cellPx);
      const rows = Math.floor(H / cellPx);
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      octx.drawImage(img, 0, 0, cols, rows);
      const data = octx.getImageData(0, 0, cols, rows).data;

      const buckets = new Map<string, number>();
      palette = [];
      cells = [];
      for (let gy = 0; gy < rows; gy++) {
        for (let gx = 0; gx < cols; gx++) {
          const i = (gy * cols + gx) * 4;
          const a = data[i + 3]! / 255;
          if (a < 0.12) continue; // soft edges fade out instead of a hard cut
          let r = data[i]!,
            g = data[i + 1]!,
            b = data[i + 2]!;
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          // brighten so skin, beard and turban read on black; fade only at the soft edges
          const k = Math.sqrt(a);
          const lift = 1.4 + (1 - lum) * 1.1;
          r = Math.min(255, (r * lift + 40) * k);
          g = Math.min(255, (g * lift + 34) * k);
          b = Math.min(255, (b * lift + 30) * k);
          const q = (v: number) => Math.round(v / 32) * 32;
          const key = `${q(r)},${q(g)},${q(b)}`;
          let bucket = buckets.get(key);
          if (bucket === undefined) {
            bucket = palette.length;
            buckets.set(key, bucket);
            palette.push(`rgb(${key})`);
          }
          const idx = 5 + Math.floor(lum * (RAMP.length - 5));
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
      reveal = { x: p.x, y: p.y, t: performance.now() };
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
      ctx.clearRect(0, 0, W, H);
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

      if (!reduced) {
        // scan line: a slow light sweep down the portrait every ~7s
        const sweep = ((t % 7) / 7) * 1.35 - 0.15;
        const bandY = sweep * H;
        const bandH = cellPx * 2.2;
        ctx.fillStyle = "#fff4e2";
        for (const c of cells) {
          const d = Math.abs(c.hy - bandY);
          if (d > bandH) continue;
          ctx.globalAlpha = alpha * (1 - d / bandH) * 0.85;
          ctx.fillText(c.ch, c.x, c.y);
        }

        // x-ray lens: the code parts and the real photo shows underneath
        const inside =
          pointer.active === 1 && pointer.x > 0 && pointer.y > 0 && pointer.x < W && pointer.y < H;
        lens.k += ((inside ? 1 : 0) - lens.k) * 0.12 * dt;
        lens.x += (pointer.x - lens.x) * 0.25 * dt;
        lens.y += (pointer.y - lens.y) * 0.25 * dt;
        if (lens.k > 0.02 && dissolve < 0.6) {
          const r = size * 0.13 * lens.k;
          ctx.save();
          ctx.beginPath();
          ctx.arc(lens.x, lens.y, r, 0, Math.PI * 2);
          ctx.clip();
          ctx.globalAlpha = alpha * lens.k;
          ctx.drawImage(sharp(), 0, 0, W, H);
          ctx.restore();
          ctx.globalAlpha = alpha * lens.k * 0.9;
          ctx.strokeStyle = "#ff6a2b";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(lens.x, lens.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      if (reveal.t >= 0) {
        // the frame clock can lag the tap by a few ms: never let age go negative
        const age = Math.max(0, (now - reveal.t) / 1000);
        let k: number;
        if (reduced) k = age < HOLD ? 1 : 0;
        else if (age < OPEN) k = 1 - Math.pow(1 - age / OPEN, 3);
        else if (age < OPEN + HOLD) k = 1;
        else if (age < OPEN + HOLD + CLOSE) k = 1 - Math.pow((age - OPEN - HOLD) / CLOSE, 2);
        else k = 0;
        if (age >= (reduced ? HOLD : OPEN + HOLD + CLOSE)) reveal.t = -1;
        else if (k > 0) {
          const maxR = Math.hypot(
            Math.max(reveal.x, W - reveal.x),
            Math.max(reveal.y, H - reveal.y),
          );
          const r = Math.max(1, k * maxR);
          ctx.save();
          ctx.beginPath();
          ctx.arc(reveal.x, reveal.y, r, 0, Math.PI * 2);
          ctx.clip();
          ctx.globalAlpha = 1;
          ctx.drawImage(sharp(), 0, 0, W, H);
          ctx.restore();
          if (k < 1) {
            ctx.globalAlpha = 0.9;
            ctx.strokeStyle = "#ff6a2b";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(reveal.x, reveal.y, r, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
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
  }, [src, revealSrc, reduced]);

  return (
    <div ref={host} className="v2-ascii" aria-hidden>
      <canvas ref={canvas} />
    </div>
  );
}
