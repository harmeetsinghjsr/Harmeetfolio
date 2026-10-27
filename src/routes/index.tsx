import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Menu, X, ArrowUp, Mail, Copy } from "lucide-react";
import { toast } from "sonner";
import Lenis from "lenis";
import photo from "@/assets/harmeet.jpg.asset.json";
import {
  profile,
  hero,
  projects,
  alsoBuilt,
  experience,
  skills,
  alsoWorkedWith,
  about,
  contact,
} from "@/content";
import { Reveal, SectionLabel, Tilt, Chip, btn } from "@/components/ui-bits";
import { SoundToggle } from "@/components/SoundUI";
import { Cursor, DecodeText, Terminal } from "@/components/Polish";
import { CursorField } from "@/components/CursorField";
import { HeroUI } from "@/components/HeroUI";
import { useReduced, setReduced } from "@/lib/motion";

const ReliabilityCore = lazy(() => import("@/components/ReliabilityCore"));
import { ReliabilityCoreFallback } from "@/components/ReliabilityCoreFallback";
import { useSectionMorph } from "@/lib/scroll-morph";
const Portrait = lazy(() => import("@/components/Portrait"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Harmeet Singh — Software Developer" },
      { name: "description", content: hero.subline },
      { property: "og:title", content: "Harmeet Singh — Software Developer" },
      { property: "og:description", content: hero.subline },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const resumeHref = profile.resume || profile.linkedin;
let lenis: Lenis | null = null;

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -72 });
  else
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 72,
      behavior: "auto",
    });
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const navItems = [
  { id: "signal", label: "Signal", target: "top", number: "00" },
  { id: "systems", label: "Systems", target: "work", number: "01" },
  { id: "telemetry", label: "Telemetry", target: "experience", number: "02" },
  { id: "toolkit", label: "Toolkit", target: "skills", number: "03" },
  { id: "about", label: "About", target: "about", number: "04" },
  { id: "launch", label: "Launch", target: "contact", number: "05" },
] as const;

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("signal");
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 24);

      let current = "signal";
      const threshold = window.scrollY + 112;
      for (const item of navItems) {
        if (item.target === "top") continue;
        const el = document.getElementById(item.target);
        if (el && el.getBoundingClientRect().top + window.scrollY <= threshold) current = item.id;
      }
      setActive(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const menuButton = menuButtonRef.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const focusable = mobilePanelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      menuButton?.focus();
    };
  }, [open]);

  const go = (target: string) => {
    setOpen(false);
    if (target === "top") {
      if (lenis) lenis.scrollTo(0);
      else window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setTimeout(() => scrollTo(target), 50);
  };

  return (
    <header className={`mission-nav fixed inset-x-0 top-0 z-50 ${scrolled ? "is-scrolled" : ""}`}>
      <nav className="container-x mission-nav-inner" aria-label="Primary navigation">
        <button
          onClick={() => go("top")}
          className="mission-brand"
          aria-label={`${profile.name}, return to top`}
        >
          <span className="mission-brand-mark" aria-hidden>
            HS
          </span>
          <span className="mission-brand-copy">
            <span className="mission-brand-name">{profile.name}</span>
            <span className="mission-brand-status">
              <span className="mission-status-dot" /> SYSTEM ONLINE
            </span>
          </span>
        </button>

        <div className="mission-nav-links hidden md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.target)}
              className={`mission-nav-link ${active === item.id ? "is-active" : ""}`}
              aria-current={active === item.id ? "page" : undefined}
            >
              <span className="mission-nav-index">{item.number}</span>
              {item.label}
              <span className="mission-nav-pulse" aria-hidden />
            </button>
          ))}
        </div>

        <div className="mission-nav-actions hidden md:flex">
          <SoundToggle />
          <a href={resumeHref} target="_blank" rel="noreferrer" className="mission-resume">
            Résumé <span aria-hidden>↗</span>
          </a>
          <button onClick={() => go("contact")} className="mission-talk">
            Let's talk <span aria-hidden>→</span>
          </button>
        </div>

        <div className="mission-mobile-controls md:hidden">
          <SoundToggle />
          <button
            aria-label="Open navigation menu"
            aria-controls="mobile-navigation"
            aria-expanded={open}
            ref={menuButtonRef}
            className="mission-menu-button"
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mission-mobile-panel md:hidden"
            id="mobile-navigation"
            ref={mobilePanelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="mission-mobile-head">
              <div className="mission-brand-copy">
                <span className="mission-brand-name">{profile.name}</span>
                <span className="mission-brand-status">
                  <span className="mission-status-dot" /> NAVIGATION ONLINE
                </span>
              </div>
              <button
                aria-label="Close navigation menu"
                ref={closeButtonRef}
                className="mission-menu-button"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mission-mobile-meta">
              <span>Navigation index</span>
              <span>06 routes / local</span>
            </div>
            <div className="mission-mobile-links">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => go(item.target)}
                  className={`mission-mobile-link ${active === item.id ? "is-active" : ""}`}
                  aria-current={active === item.id ? "page" : undefined}
                >
                  <span className="mission-mobile-number">{item.number}</span>
                  <span>{item.label}</span>
                  <span className="mission-mobile-arrow" aria-hidden>
                    ↗
                  </span>
                </button>
              ))}
            </div>

            <div className="mission-mobile-footer">
              <a href={resumeHref} target="_blank" rel="noreferrer" className="mission-mobile-cta">
                Résumé <span aria-hidden>↗</span>
              </a>
              <button
                onClick={() => go("contact")}
                className="mission-mobile-cta mission-mobile-cta-primary"
              >
                Let's talk <span aria-hidden>→</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero() {
  const [gl, setGl] = useState(false);
  const reduced = useReduced();
  useEffect(() => {
    const lowPower = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    setGl(!reduced && !lowPower && hasWebGL());
  }, [reduced]);

  return (
    <HeroUI
      scrollToWork={() => scrollTo("work")}
      scene={
        <div className="hero-scene" aria-hidden>
          <ClientOnly fallback={<ReliabilityCoreFallback />}>
            {gl ? (
              <Suspense fallback={<ReliabilityCoreFallback />}>
                <ReliabilityCore />
              </Suspense>
            ) : (
              <ReliabilityCoreFallback />
            )}
          </ClientOnly>
        </div>
      }
    />
  );
}

function Section({
  id,
  n,
  label,
  title,
  subtitle,
  children,
}: {
  id: string;
  n: string;
  label: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const reduced = useReduced();

  return (
    <section id={id} className="relative container-x py-24 md:py-32">
      <motion.div
        aria-hidden
        className="sweep-line absolute inset-x-0 top-0 origin-left"
        initial={reduced ? false : { scaleX: 0, opacity: 0 }}
        whileInView={reduced ? undefined : { scaleX: [0, 1, 1], opacity: [0, 1, 0.25] }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
      <Reveal>
        <SectionLabel n={n} label={label} />
        <h2 className="mt-4 text-3xl font-medium md:text-5xl">
          <DecodeText text={title} />
        </h2>
        {subtitle && <p className="mt-3 max-w-xl text-muted-foreground">{subtitle}</p>}
      </Reveal>
      <div className="mt-12">{children}</div>
    </section>
  );
}

function ProjectLinks({ project }: { project: (typeof projects)[number] }) {
  if (!project.live && !project.code) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {project.live && (
        <a href={project.live} target="_blank" rel="noreferrer" className={btn.small}>
          Live ↗
        </a>
      )}
      {project.code && (
        <a href={project.code} target="_blank" rel="noreferrer" className={btn.small}>
          Code ↗
        </a>
      )}
    </div>
  );
}

function ProjectSignal({
  project,
  compact = false,
}: {
  project: (typeof projects)[number];
  compact?: boolean;
}) {
  return (
    <div
      className={`project-signal ${compact ? "is-compact" : ""}`}
      data-project-signal={project.title}
      aria-hidden
    >
      <div className="project-signal-grid" />
      <div className="project-signal-orbit project-signal-orbit-one" />
      <div className="project-signal-orbit project-signal-orbit-two" />
      <div className="project-signal-core" />
      <span className="project-signal-label project-signal-label-top">
        {project.category.split(" · ")[0]}
      </span>
      <span className="project-signal-label project-signal-label-bottom">
        {compact ? "SYSTEM READY" : "DEPLOYED / OBSERVABLE"}
      </span>
      <span className="project-signal-pulse" />
    </div>
  );
}

function Work() {
  const [featured, ...rest] = projects;
  const supporting = rest.slice(0, 2);
  const archive = rest.slice(2);
  const [showArchive, setShowArchive] = useState(false);

  return (
    <Section
      id="work"
      n="01"
      label="Systems shipped"
      title="Work that keeps moving"
      subtitle="A few systems I built, deployed, debugged, and kept alive after launch."
    >
      <Reveal>
        <Tilt className="rounded-[1.5rem]" data-cursor="view">
          <article className="systems-featured">
            <div className="systems-featured-copy">
              <div className="flex items-center justify-between gap-4">
                <p className="systems-kicker">
                  <span className="systems-live-dot" /> FEATURED SYSTEM / 001
                </p>
                <span className="systems-index">01 / 06</span>
              </div>
              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                {featured.category}
              </p>
              <h3 className="mt-3 max-w-xl text-4xl font-medium tracking-tight md:text-6xl">
                {featured.title}
              </h3>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {featured.description}
              </p>
              {featured.role && (
                <p className="mt-5 font-mono text-xs uppercase tracking-[0.12em] text-foreground/70">
                  Role / {featured.role}
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-2">
                {featured.tags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ProjectLinks project={featured} />
                <span className="systems-arrow-note">
                  Inspect the deployment <span aria-hidden>↓</span>
                </span>
              </div>
            </div>
            <div className="systems-featured-visual">
              <ProjectSignal project={featured} />
              <div className="systems-featured-telemetry">
                <span>VOICE ENGINE</span>
                <span>20 CHANNELS</span>
                <span>R2 / POLAR / NEON</span>
              </div>
            </div>
          </article>
        </Tilt>
      </Reveal>

      <Reveal className="mt-5" delay={0.08}>
        <div className="grid gap-5 md:grid-cols-2">
          {supporting.map((project) => (
            <Tilt key={project.title} className="h-full rounded-[1.35rem]" data-cursor="view">
              <article className="systems-support-card">
                <ProjectSignal project={project} compact />
                <div className="systems-support-copy">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                        {project.category}
                      </p>
                      <h3 className="mt-2 text-2xl font-medium">{project.title}</h3>
                    </div>
                    <span className="systems-card-number">0{supporting.indexOf(project) + 2}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.tags.slice(0, 4).map((tag) => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                  </div>
                  <div className="mt-6">
                    <ProjectLinks project={project} />
                  </div>
                </div>
              </article>
            </Tilt>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-16">
        <div className="systems-archive-head">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Archive / additional systems
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Experiments, dashboards, hardware, and prototypes.
            </p>
          </div>
          <button
            className="systems-archive-toggle"
            onClick={() => setShowArchive((value) => !value)}
            aria-expanded={showArchive}
          >
            {showArchive
              ? "Collapse archive"
              : `Open archive · ${archive.length + alsoBuilt.length} items`}{" "}
            <span aria-hidden>{showArchive ? "↑" : "↓"}</span>
          </button>
        </div>
        {showArchive && (
          <ul className="systems-archive-list">
            {archive.map((project) => (
              <li key={project.title} className="systems-archive-row">
                <div>
                  <span className="systems-archive-title">{project.title}</span>
                  <span className="systems-archive-description"> — {project.description}</span>
                </div>
                <div className="flex shrink-0 gap-2">
                  <ProjectLinks project={project} />
                </div>
              </li>
            ))}
            {alsoBuilt.map((item) => (
              <li key={item.title} className="systems-archive-row">
                <div>
                  <span className="systems-archive-title">{item.title}</span>
                  <span className="systems-archive-description"> — {item.description}</span>
                </div>
                <div className="flex shrink-0 gap-2">
                  {item.live && (
                    <a href={item.live} target="_blank" rel="noreferrer" className={btn.small}>
                      Live ↗
                    </a>
                  )}
                  {item.code && (
                    <a href={item.code} target="_blank" rel="noreferrer" className={btn.small}>
                      Code ↗
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </Section>
  );
}

function Experience() {
  const reduced = useReduced();

  return (
    <Section
      id="experience"
      n="02"
      label="Telemetry"
      title="Experience that compounds"
      subtitle="A record of systems built, quality signals improved, and responsibility expanded over time."
    >
      <div className="experience-timeline">
        <motion.div
          aria-hidden
          className="experience-spine"
          initial={reduced ? false : { scaleY: 0 }}
          whileInView={reduced ? undefined : { scaleY: 1 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <ol className="relative">
          {experience.map((e, index) => (
            <Reveal key={e.company} delay={index * 0.08}>
              <li
                className={`experience-entry relative pl-8 ${index === experience.length - 1 ? "is-last" : ""}`}
              >
                <motion.span
                  aria-hidden
                  className="experience-node"
                  initial={reduced ? false : { scale: 0.4, opacity: 0 }}
                  whileInView={reduced ? undefined : { scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.45, delay: index * 0.08 + 0.12 }}
                />
                <div className="experience-entry-head">
                  <div>
                    <p className="experience-meta">
                      <span>{e.dates}</span>
                      <span aria-hidden>·</span>
                      <span>{e.location}</span>
                    </p>
                    <h3 className="mt-2 text-xl font-medium md:text-2xl">{e.role}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-3 text-muted-foreground">
                      {e.company}
                      {e.link && (
                        <a
                          href={e.link.href}
                          target="_blank"
                          rel="noreferrer"
                          className={btn.small}
                        >
                          {e.link.label} ↗
                        </a>
                      )}
                    </p>
                  </div>
                  <span className="experience-index">
                    0{index + 1} / 0{experience.length}
                  </span>
                </div>
                <div className="experience-summary">
                  <p className="max-w-2xl text-sm leading-relaxed text-foreground/85 md:text-base">
                    {e.summary}
                  </p>
                  <span className="experience-impact">{e.impact}</span>
                </div>
                <div className="experience-tools" aria-label={`${e.company} tools`}>
                  {e.tools.map((tool) => (
                    <Chip key={tool}>{tool}</Chip>
                  ))}
                </div>
                <details className="experience-details">
                  <summary>
                    <span>Open telemetry</span>
                    <span aria-hidden className="experience-details-icon">
                      ↓
                    </span>
                  </summary>
                  <ul className="mt-5 max-w-3xl space-y-3">
                    {e.bullets.map((b) => (
                      <li
                        key={b}
                        className="relative pl-4 text-sm leading-relaxed text-muted-foreground before:absolute before:left-0 before:top-2.5 before:size-1 before:rounded-full before:bg-accent"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}

function Skills() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSkill = skills[activeIndex];

  return (
    <Section
      id="skills"
      n="03"
      label="Toolkit"
      title="The tools behind the signal"
      subtitle="A practical map of the technologies I use to move from idea to dependable software."
    >
      <Reveal>
        <div className="toolkit-system">
          <div className="toolkit-map" aria-label="Skill categories">
            <svg className="toolkit-connections" viewBox="0 0 100 100" aria-hidden>
              {skills.map((skill, index) => {
                const points = ["22,22 50,50", "78,22 50,50", "50,78 50,50"];
                return (
                  <polyline
                    key={skill.id}
                    points={points[index]}
                    className={index === activeIndex ? "is-active" : ""}
                  />
                );
              })}
            </svg>
            <div className="toolkit-core" aria-hidden>
              <span className="toolkit-core-ring" />
              <span className="toolkit-core-label">STACK</span>
              <span className="toolkit-core-status">READY</span>
            </div>
            {skills.map((skill, index) => (
              <button
                key={skill.id}
                type="button"
                className={`toolkit-node toolkit-node-${index + 1} ${index === activeIndex ? "is-active" : ""}`}
                onClick={() => setActiveIndex(index)}
                aria-pressed={index === activeIndex}
                aria-label={`Select ${skill.title} skills`}
              >
                <span className="toolkit-node-index">0{index + 1}</span>
                <span>{skill.title}</span>
                <span className="toolkit-node-signal">{skill.signal}</span>
              </button>
            ))}
          </div>

          <div className="toolkit-detail" aria-live="polite">
            <div className="toolkit-detail-head">
              <div>
                <p className="toolkit-detail-kicker">Active channel / 0{activeIndex + 1}</p>
                <h3 className="mt-2 text-2xl font-medium md:text-3xl">{activeSkill.title}</h3>
              </div>
              <span className="toolkit-detail-state">{activeSkill.signal}</span>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              {activeSkill.description}
            </p>
            <div className="toolkit-tool-grid" aria-label={`${activeSkill.title} technologies`}>
              {activeSkill.items.map((tool) => (
                <span key={tool} className="toolkit-tool">
                  <span className="toolkit-tool-dot" aria-hidden />
                  {tool}
                </span>
              ))}
            </div>
            <div className="toolkit-related">
              <div>
                <p className="toolkit-related-label">Related systems</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeSkill.relatedProjects.map((project) => (
                    <Chip key={project}>{project}</Chip>
                  ))}
                </div>
              </div>
              <div>
                <p className="toolkit-related-label">Applied at</p>
                <p className="mt-2 text-sm text-foreground/85">{activeSkill.relatedExperience}</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
      <Reveal className="mt-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Also worked with
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {alsoWorkedWith.map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

function About() {
  return (
    <Section
      id="about"
      n="04"
      label="Human layer"
      title="The human behind the systems"
      subtitle="A builder's path from hardware experiments to dependable AI and cloud software."
    >
      <div className="about-layout">
        <Reveal>
          <div className="about-story">
            <p className="about-story-kicker">Origin signal / 04</p>
            <p className="mt-4 text-base leading-relaxed text-foreground/90 md:text-lg">
              {about.bio}
            </p>
          </div>
          <div className="about-progression">
            <div className="about-progression-line" aria-hidden />
            {about.progression.map((step, index) => (
              <div key={step.label} className="about-progression-step">
                <span className="about-progression-node">0{index + 1}</span>
                <div>
                  <p className="about-progression-label">{step.label}</p>
                  <h3 className="mt-1 text-lg font-medium">{step.value}</h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="about-info-grid">
            <div className="about-info-card">
              <p className="about-info-label">Education</p>
              <p className="mt-2 font-medium">{about.education.degree}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {about.education.school} · {about.education.dates} · {about.education.grade}
              </p>
            </div>
            <div className="about-info-card">
              <p className="about-info-label">Recognition</p>
              <ul className="mt-2 space-y-2">
                {about.recognition.map((r) => (
                  <li key={r} className="text-sm leading-relaxed text-muted-foreground">
                    <span className="mr-2 text-primary">✦</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="about-identity">
            <div className="about-identity-head">
              <span className="about-story-kicker">Identity module</span>
              <span className="about-identity-status">
                <span className="mission-status-dot" /> ACTIVE
              </span>
            </div>
            <ClientOnly
              fallback={
                <div className="mx-auto aspect-[4/5] max-w-sm rounded-[24px] border border-border bg-card" />
              }
            >
              <Suspense
                fallback={
                  <div className="mx-auto aspect-[4/5] max-w-sm rounded-[24px] border border-border bg-card" />
                }
              >
                <Portrait src={photo.url} className="mx-auto max-w-sm" />
              </Suspense>
            </ClientOnly>
            <div className="about-identity-footer">
              <div>
                <p className="about-info-label">Origin</p>
                <p className="mt-1 text-sm text-foreground/85">{about.identity.origin}</p>
              </div>
              <div>
                <p className="about-info-label">Current focus</p>
                <p className="mt-1 text-sm text-foreground/85">{about.identity.focus}</p>
              </div>
              <span className="about-identity-signal">{about.identity.currentSignal}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
      toast.success("Email copied");
    } catch {
      toast.error("Couldn't copy — " + profile.email);
    }
  };
  return (
    <Section id="contact" n="05" label="Launch" title={contact.title} subtitle={contact.line}>
      <Reveal>
        <div className="launch-panel">
          <div className="launch-panel-copy">
            <div className="launch-panel-head">
              <p className="launch-kicker">
                <span className="systems-live-dot" /> TRANSMISSION / {contact.status}
              </p>
              <span className="launch-index">05 / 05</span>
            </div>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-foreground/85 md:text-lg">
              Tell me what you are trying to make dependable, and I will bring the product thinking,
              automation, and engineering detail to move it forward.
            </p>
            <div className="launch-email-line">
              <span className="launch-email-label">Primary channel</span>
              <a href={`mailto:${profile.email}`} className="launch-email-address">
                {profile.email}
              </a>
            </div>
            <div className="launch-actions">
              <a
                href={`mailto:${profile.email}`}
                className={btn.primary + " !px-7 !py-4 text-base"}
              >
                <Mail className="size-5" /> Email me
              </a>
              <button onClick={copy} className={btn.ghost + " !py-4"} aria-live="polite">
                <Copy className="size-4" /> {copied ? "Copied" : "Copy email"}
              </button>
              <a
                href={resumeHref}
                target="_blank"
                rel="noreferrer"
                className={btn.ghost + " !py-4"}
              >
                Résumé ↗
              </a>
            </div>
            <p className="launch-availability">
              <span className="mission-status-dot" /> {contact.availability} · {profile.location}
            </p>
          </div>
          <div className="launch-sequence" aria-label="Launch sequence">
            <p className="launch-sequence-label">Launch sequence</p>
            <div className="launch-sequence-line" aria-hidden />
            <div className="launch-sequence-step">
              <span>01</span>
              <div>
                <strong>Introduce</strong>
                <p>Share the problem, context, and the outcome you need.</p>
              </div>
            </div>
            <div className="launch-sequence-step">
              <span>02</span>
              <div>
                <strong>Align</strong>
                <p>Find the smallest reliable path from idea to working system.</p>
              </div>
            </div>
            <div className="launch-sequence-step">
              <span>03</span>
              <div>
                <strong>Ship</strong>
                <p>Leave behind software that keeps moving after launch.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="launch-socials">
          <p className="launch-socials-label">Other channels</p>
          <div className="launch-social-links">
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="launch-social-link"
            >
              <FaGithub className="size-5" /> GitHub <span aria-hidden>↗</span>
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="launch-social-link"
            >
              <FaLinkedin className="size-5" /> LinkedIn <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function Footer() {
  const [year, setYear] = useState<number | null>(null);
  const reduced = useReduced();
  useEffect(() => setYear(new Date().getFullYear()), []);
  return (
    <footer className="border-t border-border">
      <div className="container-x flex items-center justify-between gap-4 py-8 text-xs text-muted-foreground">
        <p>
          © {year ?? ""} {profile.name} · {profile.location}
        </p>
        <div className="flex items-center gap-3">
          <button aria-pressed={reduced} onClick={() => setReduced(!reduced)} className={btn.small}>
            {reduced ? "✓ " : ""}Reduce motion
          </button>
          <button
            aria-label="Back to top"
            onClick={() => (lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0 }))}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border transition hover:border-primary hover:text-primary"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}

function Index() {
  const reduced = useReduced();
  useEffect(() => {
    if (reduced) return;
    lenis = new Lenis({ autoRaf: true });
    return () => {
      lenis?.destroy();
      lenis = null;
    };
  }, [reduced]);

  // Scroll-driven galaxy morphing
  useSectionMorph([
    { id: "work", form: "constellation" },
    { id: "experience", form: "pipeline" },
    { id: "skills", form: "orbits" },
    { id: "about", form: "nebula" },
    { id: "contact", form: "letsTalk" },
  ]);

  return (
    <>
      <a
        href="#content"
        className="fixed left-4 top-2 z-[120] -translate-y-20 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground focus:translate-y-0"
      >
        Skip to content
      </a>
      <Cursor />
      <CursorField />
      <Terminal />
      <Nav />
      <div className="site-atom-background" aria-hidden>
        <span className="site-atom-orbit site-atom-orbit-one" />
        <span className="site-atom-orbit site-atom-orbit-two" />
        <span className="site-atom-orbit site-atom-orbit-three" />
        <span className="site-atom-axis site-atom-axis-horizontal" />
        <span className="site-atom-axis site-atom-axis-vertical" />
        <span className="site-atom-core" />
        <span className="site-atom-core-halo" />
        <span className="site-atom-node site-atom-node-one" />
        <span className="site-atom-node site-atom-node-two" />
        <span className="site-atom-node site-atom-node-three" />
        <span className="site-atom-readout site-atom-readout-top">SYSTEM / 01</span>
        <span className="site-atom-readout site-atom-readout-bottom">ORBITAL FIELD / ONLINE</span>
      </div>
      <main id="content" tabIndex={-1} className="outline-none">
        <Hero />
        <Work />
        <Experience />
        <Skills />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
