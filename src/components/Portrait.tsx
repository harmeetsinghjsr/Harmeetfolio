import { motion } from "framer-motion";
import { useReduced } from "@/lib/motion";
import { useEffect, useRef, useState } from "react";
import { isTouchDevice, onScrollFrame } from "@/lib/device";
import { cn } from "@/lib/utils";

// The photo itself carries the motion: it breathes slowly, tips toward the cursor,
// catches a soft light that follows the pointer, and settles into place the first
// time the section is scrolled to.
export default function Portrait({ src, className }: { src: string; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const reduce = useReduced();
  const [imageFailed, setImageFailed] = useState(false);

  // Touch screens: the photo drifts and tips with scroll instead of the cursor.
  useEffect(() => {
    const el = wrap.current;
    if (!el || reduce || !isTouchDevice()) return;
    return onScrollFrame(() => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      const k = Math.max(-1, Math.min(1, ((r.top + r.height / 2) / vh - 0.5) * 2));
      el.style.setProperty("--py", `${(k * 10).toFixed(1)}px`);
      el.style.setProperty("--rx", `${(k * -5).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(k * 3).toFixed(2)}deg`);
      (el.parentElement ?? el).style.setProperty("--gx", `${(50 + k * 25).toFixed(1)}%`);
      (el.parentElement ?? el).style.setProperty("--gy", `${(50 - k * 40).toFixed(1)}%`);
      (el.parentElement ?? el).style.setProperty("--go", (Math.max(0, 1 - Math.abs(k) * 1.3) * 0.7).toFixed(2));
    });
  }, [reduce]);

  const onMove = (e: React.PointerEvent) => {
    const el = wrap.current;
    if (!el || reduce) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--px", `${(x - 0.5) * -16}px`);
    el.style.setProperty("--py", `${(y - 0.5) * -16}px`);
    el.style.setProperty("--rx", `${(0.5 - y) * 7}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 7}deg`);
    (el.parentElement ?? el).style.setProperty("--gx", `${x * 100}%`);
    (el.parentElement ?? el).style.setProperty("--gy", `${y * 100}%`);
    (el.parentElement ?? el).style.setProperty("--go", "1");
  };

  const onLeave = () => {
    const el = wrap.current;
    if (!el) return;
    for (const v of ["--px", "--py", "--rx", "--ry"]) el.style.setProperty(v, "0");
    (el.parentElement ?? el).style.setProperty("--go", "0");
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 1.1 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative aspect-[4/5] overflow-hidden rounded-[24px] border border-border bg-card",
        className,
      )}
    >
      <div
        ref={wrap}
        onPointerMove={(e) => e.pointerType === "mouse" && onMove(e)}
        onPointerLeave={(e) => e.pointerType === "mouse" && onLeave()}
        className="absolute inset-0 overflow-hidden rounded-[24px]"
        style={{
          transform:
            "translate3d(var(--px, 0), var(--py, 0), 0) perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
          transition: "transform 350ms ease-out",
        }}
      >
        <div className="portrait-fallback" aria-hidden={imageFailed ? undefined : true}>
          <div className="portrait-fallback-grid" />
          <div className="portrait-fallback-orbit portrait-fallback-orbit-one" />
          <div className="portrait-fallback-orbit portrait-fallback-orbit-two" />
          <div className="portrait-fallback-core">
            <span>HS</span>
          </div>
          <p className="portrait-fallback-name">HARMEET SINGH</p>
          <p className="portrait-fallback-meta">SOFTWARE / SYSTEMS / INDIA</p>
        </div>
        {/* Overscaled so the tilt and drift never pull the frame's edges into view,
            then cropped from the top so the desk in the foreground stays out of shot. */}
        {!imageFailed && (
          <div className="absolute -inset-[8%]">
            <div
              className="size-full"
              style={{ transform: "scale(1.38)", transformOrigin: "50% 2%" }}
            >
              <img
                src={src}
                alt="Harmeet Singh"
                loading="lazy"
                onError={() => setImageFailed(true)}
                className="photo-breathe size-full object-cover"
                style={{
                  objectPosition: "50% 0%",
                  filter: "brightness(1.15) contrast(1.06) saturate(1.06)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[24px] transition-opacity duration-500"
        style={{
          opacity: "var(--go, 0)",
          background:
            "radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), color-mix(in oklab, var(--primary) 26%, transparent), transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[24px]"
        style={{
          background: "radial-gradient(130% 90% at 50% 0%, transparent 45%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </motion.div>
  );
}
