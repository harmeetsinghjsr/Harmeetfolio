import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Lenis from "lenis";
import { profile, projects, alsoBuilt, experience, skills, alsoWorkedWith, about } from "@/content";
import { useReduced } from "@/lib/motion";
import { toggleIntro, useIntro } from "@/lib/sound";
import { AsciiPortrait } from "./AsciiPortrait";

const BASE = import.meta.env.BASE_URL;
const EASE = [0.22, 1, 0.36, 1] as const;

const shots: Record<string, string> = {
  Resonance: `${BASE}v2/resonance-app.jpg`,
  Harmflix: `${BASE}v2/harmflix.jpg`,
  HarCoin: `${BASE}v2/harcoin.jpg`,
  "BST Visualizer": `${BASE}v2/bstv.jpg`,
};

/* ---------------------------------------------------------------- helpers */

function useIstClock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Kolkata",
      hour12: false,
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function isFinePointer() {
  return (
    typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

/** A line of text that rises out of a mask when it scrolls into view. */
function Line({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReduced();
  // Observe the mask (outer span), not the text inside it: the text starts fully
  // clipped below the mask, so it would never register as "in view" itself.
  return (
    <motion.span
      className={`v2-line ${className}`}
      initial={reduced ? false : "hide"}
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
    >
      <motion.span
        className="v2-line-inner"
        variants={{
          hide: { y: "110%" },
          show: { y: "0%", transition: { duration: 1.05, delay, ease: EASE } },
        }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

/* ---------------------------------------------------------------- preloader */

function Preloader({ onReveal, onFinish }: { onReveal: () => void; onFinish: () => void }) {
  const reduced = useReduced();
  const [n, setN] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("v2-seen") === "1";
    } catch {
      /* storage blocked: show the preloader */
    }
    if (reduced || seen) {
      onReveal();
      onFinish();
      return;
    }
    const start = performance.now();
    const dur = 1500;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setN(Math.round(eased * 100));
      if (k < 1) raf = requestAnimationFrame(step);
      else {
        setLeaving(true);
        onReveal();
        try {
          sessionStorage.setItem("v2-seen", "1");
        } catch {
          /* ignore */
        }
        setTimeout(onFinish, 950);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [onReveal, onFinish, reduced]);
  if (reduced) return null;
  const lines = [
    "mounting harmeet.dev",
    "rendering portrait.jpg",
    "compiling 6 systems",
    "warming up the pipeline",
  ];
  return (
    <div className={`v2-pre ${leaving ? "is-leaving" : ""}`}>
      <div className="v2-pre-log mono">
        {lines.map((l, i) => (
          <div key={l} style={{ opacity: n > i * 25 ? 1 : 0.15 }}>
            <span>{n > i * 25 + 20 ? "✓" : "·"}</span> {l}
          </div>
        ))}
      </div>
      <div className="v2-pre-count serif">{String(n).padStart(3, "0")}</div>
      <div className="v2-pre-bar">
        <i style={{ transform: `scaleX(${n / 100})` }} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- cursor */

function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!isFinePointer()) return;
    document.documentElement.classList.add("v2-has-cursor");
    const m = { x: innerWidth / 2, y: innerHeight / 2 };
    const r = { x: m.x, y: m.y };
    let raf = 0;
    const move = (e: PointerEvent) => {
      m.x = e.clientX;
      m.y = e.clientY;
      const t = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-cursor]") : null;
      setLabel(t?.dataset["cursor"] ?? "");
    };
    const loop = () => {
      r.x += (m.x - r.x) * 0.18;
      r.y += (m.y - r.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate(${m.x}px, ${m.y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${r.x}px, ${r.y}px)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      document.documentElement.classList.remove("v2-has-cursor");
      removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <>
      <div ref={ring} className={`v2-cursor-ring ${label ? "has-label" : ""}`}>
        <span>{label}</span>
      </div>
      <div ref={dot} className="v2-cursor-dot" />
    </>
  );
}

/* ---------------------------------------------------------------- top bar */

function TopBar({ lenis }: { lenis: React.MutableRefObject<Lenis | null> }) {
  const clock = useIstClock();
  const { available, playing } = useIntro();
  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (lenis.current) lenis.current.scrollTo(el, { offset: -40 });
    else el.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <header className="v2-top">
      <button className="v2-brand" onClick={() => go("v2-top")} data-cursor="Top">
        <img src={`${BASE}logo.png`} alt="" width={28} height={28} />
        <span className="mono">HARMEET SINGH</span>
      </button>
      <nav className="v2-nav mono">
        <button onClick={() => go("v2-work")}>Work</button>
        <button onClick={() => go("v2-exp")}>Experience</button>
        <button onClick={() => go("v2-about")}>About</button>
        <button onClick={() => go("v2-contact")}>Contact</button>
      </nav>
      <div className="v2-top-right mono">
        {available && (
          <button
            className={`v2-voice ${playing ? "is-on" : ""}`}
            onClick={toggleIntro}
            data-cursor={playing ? "Pause" : "Listen"}
            aria-label={playing ? "Pause intro" : "Play intro"}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <i key={i} style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </button>
        )}
        <span className="v2-clock">IST {clock}</span>
        <a
          className="v2-cv"
          href={profile.resume}
          target="_blank"
          rel="noreferrer"
          data-cursor="Open"
        >
          Resume ↗
        </a>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- hero */

type Portrait = { ascii: string; reveal: string };
// Hero photos: one is picked at random on every visit.
const PORTRAITS: Portrait[] = [
  { ascii: `${BASE}v2/portrait-ascii.png`, reveal: `${BASE}v2/portrait-reveal.webp` }, // bridge selfie
  { ascii: `${BASE}v2/portrait-alt-ascii.png`, reveal: `${BASE}v2/portrait-alt-reveal.webp` }, // river
];

function Hero({
  ready,
  lenis,
  portrait,
}: {
  ready: boolean;
  lenis: React.MutableRefObject<Lenis | null>;
  portrait: Portrait | null;
}) {
  const reduced = useReduced();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const show = (d: number) => (ready ? { y: "0%" } : { y: "110%" });
  return (
    <section ref={ref} className="v2-hero" id="v2-top">
      <div className="v2-hero-art">
        {ready && portrait && (
          <AsciiPortrait
            key={portrait.ascii}
            src={portrait.ascii}
            revealSrc={portrait.reveal}
            reduced={reduced}
          />
        )}
      </div>
      <motion.div className="v2-hero-copy" style={{ y, opacity: fade }}>
        <div className="v2-kicker mono">
          <span className="v2-pulse" /> Open to full-time roles — {profile.location}
        </div>
        <h1 className="serif v2-name">
          {["Harmeet", "Singh"].map((w, i) => (
            <span className="v2-line" key={w}>
              <motion.span
                className="v2-line-inner"
                initial={{ y: "110%" }}
                animate={show(i)}
                transition={{ duration: 1.2, delay: 0.1 + i * 0.12, ease: EASE }}
              >
                {i === 1 ? <em>{w}</em> : w}
              </motion.span>
            </span>
          ))}
        </h1>
        <div className="v2-hero-sub">
          <span className="v2-line">
            <motion.span
              className="v2-line-inner"
              initial={{ y: "110%" }}
              animate={show(2)}
              transition={{ duration: 1.1, delay: 0.42, ease: EASE }}
            >
              I build software that keeps working
            </motion.span>
          </span>
          <span className="v2-line">
            <motion.span
              className="v2-line-inner"
              initial={{ y: "110%" }}
              animate={show(3)}
              transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
            >
              <em className="serif">after I log off.</em>
            </motion.span>
          </span>
        </div>
        <motion.div
          className="v2-cta"
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
        >
          <button
            className="v2-btn v2-btn-solid"
            data-cursor="Go"
            onClick={() => {
              const el = document.getElementById("v2-work");
              if (!el) return;
              if (lenis.current) lenis.current.scrollTo(el, { offset: -40 });
              else el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            See my work <span aria-hidden>↓</span>
          </button>
          <a
            className="v2-btn"
            href={profile.resume}
            target="_blank"
            rel="noreferrer"
            data-cursor="Open"
          >
            View resume <span aria-hidden>↗</span>
          </a>
        </motion.div>
        <motion.div
          className="v2-now mono"
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <span>Currently</span> Software Developer Intern @ FixGenie — remote, Canada
        </motion.div>
      </motion.div>
      <motion.div className="v2-hero-foot mono" style={{ opacity: fade }}>
        <span>Software developer · AI · Automation · Cloud</span>
        <span className="v2-hint v2-hint-fine">Hover the portrait · click to reveal</span>
        <span className="v2-hint v2-hint-touch">Tap the portrait to reveal me</span>
        <span>Scroll ↓</span>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------- statement */

function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReduced();
  const text =
    "I'm a software developer from Jamshedpur. I build AI products, automation pipelines and cloud systems, and I care most about what happens after launch, when nobody is watching.";
  const accent = new Set(["AI", "products,", "automation", "after", "launch,"]);
  const words = text.split(" ");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const [p, setP] = useState(reduced ? 1 : 0);
  useEffect(
    () => scrollYProgress.on("change", (v) => !reduced && setP(v)),
    [scrollYProgress, reduced],
  );
  return (
    <section className="v2-statement">
      <div className="v2-label mono">(01) — Intro</div>
      <p ref={ref} className="serif">
        {words.map((w, i) => {
          const k = Math.max(0, Math.min(1, p * words.length * 1.15 - i));
          return (
            <span
              key={i}
              className={accent.has(w) ? "acc" : ""}
              style={{ opacity: 0.14 + k * 0.86 }}
            >
              {w}{" "}
            </span>
          );
        })}
      </p>
    </section>
  );
}

/* ---------------------------------------------------------------- work */

function Work() {
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  // touch screens: tapping a project expands its details instead of leaving the site
  const [open, setOpen] = useState<number | null>(null);
  // decided after mount so the prerendered HTML matches what the client first renders
  const [fine, setFine] = useState(false);
  useEffect(() => setFine(isFinePointer()), []);

  useEffect(() => {
    if (!fine) return;
    const m = { x: 0, y: 0 },
      p = { x: 0, y: 0 };
    let raf = 0;
    const move = (e: PointerEvent) => {
      m.x = e.clientX;
      m.y = e.clientY;
    };
    const loop = () => {
      const vx = m.x - p.x;
      p.x += vx * 0.14;
      p.y += (m.y - p.y) * 0.14;
      if (preview.current)
        preview.current.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) rotate(${Math.max(-12, Math.min(12, vx * 0.06))}deg)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, [fine]);

  const year = (i: number) => (i === 0 ? "2026" : i < 3 ? "2025" : "2024");

  return (
    <section className="v2-work" id="v2-work">
      <div className="v2-label mono">(02) — Work</div>
      <div className="v2-section-head">
        <h2 className="serif">
          <Line>
            Selected <em>work</em>
          </Line>
        </h2>
        <span className="mono v2-count">({String(projects.length).padStart(2, "0")})</span>
      </div>
      <ul className="v2-rows" onPointerLeave={() => setActive(null)}>
        {projects.map((p, i) => {
          const href = p.live ?? p.code;
          if (!fine) {
            const isOpen = open === i;
            return (
              <li key={p.title} className={`v2-trow ${isOpen ? "is-open" : ""}`}>
                <button
                  className="v2-row"
                  aria-expanded={isOpen}
                  aria-controls={`v2-proj-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="mono v2-row-i">{String(i + 1).padStart(2, "0")}</span>
                  <span className="serif v2-row-title">{p.title}</span>
                  <span className="v2-row-arrow" aria-hidden>
                    +
                  </span>
                </button>
                <button
                  className="v2-tthumb"
                  tabIndex={-1}
                  aria-hidden
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {shots[p.title] ? (
                    <img className="v2-row-thumb" src={shots[p.title]} alt="" loading="lazy" />
                  ) : (
                    <span className="v2-row-thumb v2-preview-card">
                      <span className="mono">{p.category}</span>
                      <strong className="serif">{p.title}</strong>
                      <span className="mono">{p.tags.slice(0, 3).join(" · ")}</span>
                    </span>
                  )}
                </button>
                <div className="v2-tpanel" id={`v2-proj-${i}`} role="region" aria-label={p.title}>
                  <div className="v2-tpanel-inner">
                    <div className="v2-tmeta mono">
                      {p.category} · {year(i)}
                    </div>
                    <p className="v2-tdesc">{p.description}</p>
                    <ul className="v2-ttags" aria-label="Built with">
                      {p.tags.map((t) => (
                        <li key={t} className="mono">
                          {t}
                        </li>
                      ))}
                    </ul>
                    <div className="v2-tlinks">
                      {p.live && (
                        <a
                          className="v2-btn v2-btn-solid"
                          href={p.live}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Live <span aria-hidden>↗</span>
                        </a>
                      )}
                      {p.code && (
                        <a className="v2-btn" href={p.code} target="_blank" rel="noreferrer">
                          Code <span aria-hidden>↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          }
          return (
            <li key={p.title}>
              <a
                className={`v2-row ${active === i ? "is-active" : ""} ${active !== null && active !== i ? "is-dim" : ""}`}
                href={href}
                target="_blank"
                rel="noreferrer"
                onPointerEnter={() => setActive(i)}
                data-cursor={p.live ? "Visit" : "Code"}
              >
                <span className="mono v2-row-i">{String(i + 1).padStart(2, "0")}</span>
                <span className="serif v2-row-title">{p.title}</span>
                <span className="v2-row-desc">{p.description.split(". ")[0]}.</span>
                <span className="mono v2-row-meta">
                  {p.category}
                  <br />
                  {year(i)}
                </span>
                <span className="v2-row-arrow" aria-hidden>
                  ↗
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      <div className="v2-also">
        <span className="mono">Also built —</span>
        {alsoBuilt.map((a) => (
          <a
            key={a.title}
            href={a.live ?? a.code ?? undefined}
            target="_blank"
            rel="noreferrer"
            data-cursor={a.live || a.code ? "Open" : undefined}
          >
            {a.title}
          </a>
        ))}
      </div>

      {fine && (
        <div ref={preview} className={`v2-preview ${active !== null ? "is-on" : ""}`} aria-hidden>
          {projects.map((p, i) => (
            <div key={p.title} className={`v2-preview-slide ${active === i ? "is-on" : ""}`}>
              {shots[p.title] ? (
                <img src={shots[p.title]} alt="" />
              ) : (
                <div className="v2-preview-card">
                  <span className="mono">{p.category}</span>
                  <strong className="serif">{p.title}</strong>
                  <span className="mono">{p.tags.slice(0, 3).join(" · ")}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------- experience */

function Experience() {
  return (
    <section className="v2-exp" id="v2-exp">
      <div className="v2-label mono">(03) — Experience</div>
      <div className="v2-section-head">
        <h2 className="serif">
          <Line>
            Where I've <em>worked</em>
          </Line>
        </h2>
        <span className="mono v2-count">({String(experience.length).padStart(2, "0")})</span>
      </div>
      <div className="v2-exp-list">
        {experience.map((e, i) => (
          <ExpItem key={e.company} e={e} i={i} />
        ))}
      </div>
    </section>
  );
}

function ExpItem({ e, i }: { e: (typeof experience)[number]; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.article
      className="v2-exp-item"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: i * 0.05, ease: EASE }}
    >
      <div className="v2-exp-date mono">
        {e.dates}
        <span className="v2-exp-impact">{e.impact}</span>
      </div>
      <div className="v2-exp-main">
        <h3 className="serif">{e.role}</h3>
        <div className="v2-exp-co">
          {e.company}
          {e.link && (
            <a href={e.link.href} target="_blank" rel="noreferrer" data-cursor="Visit">
              {" "}
              ↗ {e.link.label}
            </a>
          )}
          <span className="mono"> · {e.location}</span>
        </div>
        <p>{e.summary}</p>
        <button
          className="v2-exp-toggle mono"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          data-cursor={open ? "Close" : "Open"}
        >
          {open ? "Less −" : "Details +"}
        </button>
        <div className={`v2-exp-details ${open ? "is-open" : ""}`}>
          <ul>
            {e.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="v2-exp-tools mono">{e.tools.join(" / ")}</div>
    </motion.article>
  );
}

/* ---------------------------------------------------------------- marquee */

function Marquee() {
  const words = [...skills.flatMap((s) => s.items.slice(0, 5)), ...alsoWorkedWith.slice(0, 4)];
  const rowA = useRef<HTMLDivElement>(null);
  const rowB = useRef<HTMLDivElement>(null);
  const reduced = useReduced();
  useEffect(() => {
    if (reduced) return;
    let x = 0,
      last = scrollY,
      vel = 0,
      dir = 1,
      raf = 0;
    const loop = () => {
      const y = scrollY;
      const d = y - last;
      last = y;
      if (d !== 0) dir = d > 0 ? 1 : -1;
      vel += (Math.min(40, Math.abs(d)) - vel) * 0.1;
      x -= (0.6 + vel * 0.35) * dir;
      const w = (rowA.current?.scrollWidth ?? 2000) / 2;
      if (x < -w) x += w;
      if (x > 0) x -= w;
      if (rowA.current) rowA.current.style.transform = `translateX(${x}px)`;
      if (rowB.current) rowB.current.style.transform = `translateX(${-w - x}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);
  const row = (outline: boolean) =>
    [...words, ...words].map((w, i) => (
      <span key={i} className={(i + (outline ? 1 : 0)) % 2 ? "o" : ""}>
        {w}
        <i>✦</i>
      </span>
    ));
  return (
    <section className="v2-marquee serif" aria-label="Toolkit">
      <div className="v2-marquee-row" ref={rowA}>
        {row(false)}
      </div>
      <div className="v2-marquee-row" ref={rowB}>
        {row(true)}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- about */

function About() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const clip = useTransform(
    scrollYProgress,
    [0.05, 0.4],
    reduced
      ? ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
      : ["inset(18% 14% 18% 14% round 18px)", "inset(0% 0% 0% 0% round 18px)"],
  );
  const imgY = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-8%", "8%"]);
  const { available, playing, progress } = useIntro();
  return (
    <section className="v2-about" id="v2-about">
      <div className="v2-about-photo" ref={ref}>
        <motion.div className="v2-about-clip" style={{ clipPath: clip }}>
          <motion.img
            src={`${BASE}harmeet.jpg`}
            alt="Harmeet Singh"
            style={{ y: imgY }}
            loading="lazy"
          />
        </motion.div>
        <span className="mono v2-about-cap">The human behind the glyphs — Chennai, 2026</span>
      </div>
      <div className="v2-about-copy">
        <div className="v2-label mono">(04) — About</div>
        <h2 className="serif">
          <Line>Arduino kid.</Line>
          <Line delay={0.08}>
            <em>Systems engineer.</em>
          </Line>
        </h2>
        <p>{about.bio}</p>
        {available && (
          <button
            className={`v2-listen ${playing ? "is-on" : ""}`}
            onClick={toggleIntro}
            data-cursor={playing ? "Pause" : "Play"}
          >
            <span className="v2-listen-icon">{playing ? "❚❚" : "▶"}</span>
            <span>
              <strong>{playing ? "Playing my intro" : "Hear my intro"}</strong>
              <em className="mono">voiced by Resonance, the AI platform I run</em>
            </span>
            <span className="v2-listen-bar">
              <i style={{ transform: `scaleX(${progress})` }} />
            </span>
          </button>
        )}
        <dl className="v2-facts">
          <div>
            <dt className="mono">Based in</dt>
            <dd>{about.identity.origin}</dd>
          </div>
          <div>
            <dt className="mono">Education</dt>
            <dd>
              {about.education.degree}, {about.education.school} ({about.education.dates})
            </dd>
          </div>
          <div>
            <dt className="mono">Recognition</dt>
            <dd>
              {about.recognition.map((r) => (
                <span key={r}>{r}</span>
              ))}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- contact */

function Contact() {
  const big = useRef<HTMLAnchorElement>(null);
  const clock = useIstClock();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const el = big.current;
    if (!el || !isFinePointer()) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2),
        y = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(x, y) < Math.max(r.width, r.height) * 0.75;
      el.style.transform = near ? `translate(${x * 0.06}px, ${y * 0.12}px)` : "";
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);
  return (
    <section className="v2-contact" id="v2-contact">
      <div className="v2-label mono">(05) — Contact</div>
      <p className="v2-contact-lede">Have a system worth building? I reply to every email.</p>
      <a
        ref={big}
        className="v2-contact-big serif"
        href={`mailto:${profile.email}`}
        data-cursor="Write"
      >
        <Line>
          Let's <em>talk</em>
        </Line>
      </a>
      <div className="v2-contact-row">
        <a className="v2-mail" href={`mailto:${profile.email}`} data-cursor="Write">
          {profile.email}
        </a>
        <button
          className="mono v2-copy"
          onClick={() => {
            void navigator.clipboard?.writeText(profile.email);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          data-cursor="Copy"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <footer className="v2-foot mono">
        <div className="v2-foot-links">
          <a href={profile.github} target="_blank" rel="noreferrer" data-cursor="Open">
            GitHub ↗
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" data-cursor="Open">
            LinkedIn ↗
          </a>
          <a href={profile.resume} target="_blank" rel="noreferrer" data-cursor="Open">
            Resume ↗
          </a>
        </div>
        <span>Jamshedpur · IST {clock}</span>
        <span>© 2026 Harmeet Singh</span>
      </footer>
    </section>
  );
}

/* ---------------------------------------------------------------- page */

export function V2() {
  const [ready, setReady] = useState(false);
  // chosen on the client after load, so the prerendered HTML stays identical for everyone
  const [portrait, setPortrait] = useState<Portrait | null>(null);
  useEffect(() => {
    setPortrait(PORTRAITS[Math.floor(Math.random() * PORTRAITS.length)] ?? PORTRAITS[0] ?? null);
  }, []);
  const [preGone, setPreGone] = useState(false);
  const lenis = useRef<Lenis | null>(null);
  const reduced = useReduced();
  const reveal = useMemo(() => () => setReady(true), []);
  const finish = useMemo(() => () => setPreGone(true), []);

  useEffect(() => {
    if (reduced) return;
    const l = new Lenis({ autoRaf: true, lerp: 0.1 });
    lenis.current = l;
    if (import.meta.env.DEV) (window as unknown as { __v2lenis?: Lenis }).__v2lenis = l;
    return () => {
      l.destroy();
      lenis.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    document.documentElement.classList.toggle("v2-locked", !ready);
    return () => document.documentElement.classList.remove("v2-locked");
  }, [ready]);

  return (
    <div className="v2">
      {!preGone && <Preloader onReveal={reveal} onFinish={finish} />}
      <Cursor />
      <div className="v2-grain" aria-hidden />
      <TopBar lenis={lenis} />
      <main>
        <Hero ready={ready} lenis={lenis} portrait={portrait} />
        <Statement />
        <Work />
        <Experience />
        <Marquee />
        <About />
        <Contact />
      </main>
    </div>
  );
}
