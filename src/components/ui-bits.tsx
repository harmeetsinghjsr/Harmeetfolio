import { motion } from "framer-motion";
import { useReduced } from "@/lib/motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReduced();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionLabel({ n, label }: { n: string; label: string }) {
  return <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"><span className="text-primary">{n}</span> &nbsp;{label}</p>;
}

export function Tilt({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const reduced = useReduced();
  useEffect(() => { setEnabled(!reduced); }, [reduced]);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !enabled) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 16}deg) rotateY(${(x - 0.5) * 16}deg)`;
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
    el.style.setProperty("--go", "1");
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.setProperty("--go", "0");
  };
  return (
    <div ref={ref} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={onLeave} onPointerUp={(e) => e.pointerType !== "mouse" && setTimeout(onLeave, 700)} {...rest} className={cn("relative transition-transform duration-300 ease-out will-change-transform", className)}>
      {children}
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300" style={{ opacity: "var(--go, 0)", background: "radial-gradient(420px circle at var(--gx) var(--gy), color-mix(in oklab, var(--primary) 18%, transparent), transparent 60%)" }} />
    </div>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-border bg-secondary px-3 py-1 font-mono text-[11px] text-muted-foreground">{children}</span>;
}

export const btn = {
  primary: "magnetic inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-110",
  ghost: "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-primary/50",
  small: "inline-flex min-h-11 items-center gap-1 rounded-full border border-border px-4 py-1 font-mono text-xs text-foreground transition hover:border-primary hover:text-primary",
};
