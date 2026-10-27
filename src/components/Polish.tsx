import { useEffect, useRef, useState } from "react";
import { profile, projects, about } from "@/content";
import { useReduced } from "@/lib/motion";

/** Dot + lagging ring cursor, plus magnetic pull on `.magnetic` elements. Desktop only. */
export function Cursor() {
  const reduced = useReduced();
  const [enabled, setEnabled] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => { setEnabled(window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced); }, [reduced]);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("custom-cursor");
    const m = { x: innerWidth / 2, y: innerHeight / 2 }, r = { x: m.x, y: m.y, vx: 0, vy: 0, s: 1 };
    let mode: "" | "hover" | "view" = "", raf = 0, last = performance.now();
    const mags = () => Array.from(document.querySelectorAll<HTMLElement>(".magnetic"));
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      m.x = e.clientX; m.y = e.clientY;
      const t = e.target as Element | null;
      mode = t?.closest("[data-cursor='view']") ? "view" : t?.closest("a,button,[role=button],input,label") ? "hover" : "";
      for (const el of mags()) {
        const b = el.getBoundingClientRect();
        const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
        const dx = m.x - cx, dy = m.y - cy;
        const near = Math.abs(dx) < b.width / 2 + 80 && Math.abs(dy) < b.height / 2 + 80;
        el.style.transform = near ? `translate(${dx * 0.25}px, ${dy * 0.3}px)` : "";
      }
    };
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); last = now;
      // spring
      const k = 220, c = 22;
      r.vx += ((m.x - r.x) * k - r.vx * c) * dt; r.vy += ((m.y - r.y) * k - r.vy * c) * dt;
      r.x += r.vx * dt; r.y += r.vy * dt;
      const ts = mode === "view" ? 2.6 : mode === "hover" ? 1.7 : 1;
      r.s += (ts - r.s) * (1 - Math.exp(-12 * dt));
      if (dot.current) dot.current.style.transform = `translate(${m.x}px, ${m.y}px) translate(-50%,-50%)`;
      if (ring.current) ring.current.style.transform = `translate(${r.x}px, ${r.y}px) translate(-50%,-50%) scale(${r.s})`;
      if (label.current) label.current.style.opacity = mode === "view" ? "1" : "0";
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf);
      mags().forEach((el) => (el.style.transform = ""));
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200]" style={{ mixBlendMode: "difference" }}>
      <div ref={ring} className="absolute left-0 top-0 grid size-9 place-items-center rounded-full border border-foreground">
        <span ref={label} className="font-mono text-[5px] uppercase tracking-widest text-foreground opacity-0 transition-opacity">View</span>
      </div>
      <div ref={dot} className="absolute left-0 top-0 size-1.5 rounded-full bg-foreground" />
    </div>
  );
}

const CHARS = "!<>-_\\/[]{}—=+*^?#ABCDEFXYZ01";
/** Scrambles into the real text the first time it enters the viewport. */
export function DecodeText({ text }: { text: string }) {
  const reduced = useReduced();
  const ref = useRef<HTMLSpanElement>(null);
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (reduced || !ref.current) return;
    let raf = 0, done = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting || done) return;
      done = true; io.disconnect();
      const start = performance.now(), dur = 900;
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / dur), n = Math.floor(p * text.length);
        setOut(text.slice(0, n) + Array.from(text.slice(n), (ch) => (ch === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)])).join(""));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { rootMargin: "-60px" });
    io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [text, reduced]);
  return <span ref={ref} aria-label={text}><span aria-hidden>{out}</span></span>;
}

type Line = { t: string; cls?: string };
const HELP = "commands: help, about, projects, resume, email, clear, exit";
/** Backtick (`) opens a retro terminal. */
export function Terminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([{ t: HELP }]);
  const [val, setVal] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "`" && tag !== "INPUT" && tag !== "TEXTAREA") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { if (open) setTimeout(() => input.current?.focus(), 20); }, [open]);
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [lines]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    const out: Line[] = [{ t: `$ ${raw}`, cls: "text-primary" }];
    const resume = profile.resume || profile.linkedin;
    if (!cmd) {}
    else if (cmd === "help") out.push({ t: HELP });
    else if (cmd === "about") out.push({ t: about.bio });
    else if (cmd === "projects") projects.forEach((p) => out.push({ t: `• ${p.title}` }));
    else if (cmd === "resume") { out.push({ t: "Opening résumé…" }); window.open(resume, "_blank"); }
    else if (cmd === "email") { out.push({ t: profile.email }); window.location.href = `mailto:${profile.email}`; }
    else if (cmd === "sudo hire harmeet") { out.push({ t: "Permission granted.", cls: "text-success" }); setTimeout(() => (window.location.href = `mailto:${profile.email}`), 400); }
    else if (cmd === "clear") { setLines([]); return; }
    else if (cmd === "exit") { setOpen(false); return; }
    else out.push({ t: `command not found: ${cmd}. Type help.` });
    setLines((l) => [...l, ...out]);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[150] grid place-items-center bg-background/70 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label="Terminal" onClick={(e) => { e.stopPropagation(); input.current?.focus(); }}
        className="terminal w-full max-w-xl overflow-hidden rounded-xl border border-success/40 bg-card font-mono text-sm shadow-[0_0_40px_color-mix(in_oklab,var(--success)_20%,transparent)]">
        <div className="flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted-foreground">
          <span>harmeet@portfolio:~</span>
          <button aria-label="Close terminal" onClick={() => setOpen(false)} className="min-h-11 min-w-11">×</button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-4 text-success" aria-live="polite">
          {lines.map((l, i) => <p key={i} className={`whitespace-pre-wrap break-words ${l.cls ?? ""}`}>{l.t}</p>)}
          <form onSubmit={(e) => { e.preventDefault(); run(val); setVal(""); }} className="flex gap-2">
            <span aria-hidden>$</span>
            <input ref={input} autoFocus aria-label="Terminal command" value={val} onChange={(e) => setVal(e.target.value)} autoComplete="off" spellCheck={false}
              className="flex-1 bg-transparent text-success caret-success outline-none" />
          </form>
          <div ref={end} />
        </div>
      </div>
    </div>
  );
}
