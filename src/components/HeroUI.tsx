import { useEffect, useState, type ReactNode } from "react";
import { MotionConfig, motion } from "framer-motion";
import { useReduced } from "@/lib/motion";
import { hero, profile } from "@/content";
import { btn } from "@/components/ui-bits";
import { IntroButton } from "@/components/SoundUI";

interface HeroUIProps {
  scrollToWork: () => void;
  scene?: ReactNode;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

export function HeroUI({ scrollToWork, scene }: HeroUIProps) {
  const reduced = useReduced();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (reduced) {
      setParticles([]);
      return;
    }
    const colors = ["var(--primary)", "var(--accent)", "#b9fff0", "#ffc08f"];
    const pts: Particle[] = [];
    for (let i = 0; i < 60; i++) {
      pts.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    setParticles(pts);
  }, [reduced]);

  return (
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <section className="relative flex min-h-dvh items-center overflow-hidden">
        <div className="absolute inset-0 bg-hero" />

        {scene}

        <div className="absolute inset-0">
          <SVGOverlay particles={particles} reduced={reduced} />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="container-x relative z-10 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="hero-copy space-y-6">
              <motion.span
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1 text-xs backdrop-blur"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative size-2 rounded-full bg-success" />
                </span>
                {hero.status}
              </motion.span>

              <motion.p
                className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                {hero.label}
              </motion.p>

              <h1 className="max-w-3xl text-4xl font-medium leading-[1.05] sm:text-6xl md:text-7xl">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="block"
                >
                  I build software that keeps working{" "}
                </motion.span>
                <motion.span
                  className="text-gradient block"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
                >
                  after I log off.
                </motion.span>
              </h1>

              <motion.p
                className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {hero.subline}
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-3 pt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px var(--primary)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToWork}
                  className="magnetic inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-110"
                >
                  See my work
                </motion.button>
                <motion.a
                  href={profile.resume || profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.05 }}
                  className={btn.ghost}
                >
                  Résumé
                </motion.a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <IntroButton />
              </motion.div>
            </div>
          </motion.div>
        </div>

        <ScrollIndicator onClick={scrollToWork} />
      </section>
    </MotionConfig>
  );
}

function ScrollIndicator({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="absolute bottom-8 left-1/2 z-10 flex min-h-11 min-w-11 -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      whileHover={{ scale: 1.1 }}
    >
      Scroll
      <motion.svg
        className="size-4"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M12 5v14M5 12l7 7 7-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.button>
  );
}

function SVGOverlay({ particles, reduced }: { particles: Particle[]; reduced: boolean }) {
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const update = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const vw = Math.max(1, dimensions.w / 100);
  const vh = Math.max(1, dimensions.h / 100);

  if (reduced) {
    return (
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <radialGradient id="hero-gradient-minimal" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.04" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#hero-gradient-minimal)" />
      </svg>
    );
  }

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <defs>
        <radialGradient id="hero-gradient" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.06" />
          <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.03" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wireframe-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.08" />
        </linearGradient>
        <filter id="wireframe-blur">
          <feBlur stdDeviation="0.3" />
        </filter>
      </defs>

      <rect x="0" y="0" width="100" height="100" fill="url(#hero-gradient)" />

      {particles.map((p) => {
        const px = p.x;
        const py = p.y;
        return (
          <g key={p.id}>
            <circle
              cx={px}
              cy={py}
              r={p.size * 0.3}
              fill={p.color}
              opacity="0.6"
              filter="url(#wireframe-blur)"
            />
            <line
              x1={px}
              y1={py}
              x2={px + 5}
              y2={py + 3}
              stroke={p.color}
              strokeWidth="0.15"
              opacity="0.3"
            />
          </g>
        );
      })}

      {particles.slice(0, 20).map((p) => {
        const px = p.x;
        const py = p.y;
        return (
          <motion.line
            key={`conn-${p.id}`}
            x1={px}
            y1={py}
            x2={px + 3}
            y2={py + 2}
            stroke="url(#wireframe-gradient)"
            strokeWidth="0.1"
            opacity="0.2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.2 }}
            transition={{ duration: 2, delay: p.id * 0.05 }}
          />
        );
      })}

      <HexGrid />
      <NoiseOverlay />
    </svg>
  );
}

function HexGrid() {
  const hexes: string[] = [];
  const size = 8;
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 6; j++) {
      const x = i * size * 0.866;
      const y = j * size + (i % 2) * size * 0.5;
      const pts = [
        `${x},${y - size / 2}`,
        `${x + size * 0.433},${y - size / 4}`,
        `${x + size * 0.433},${y + size / 4}`,
        `${x},${y + size / 2}`,
        `${x - size * 0.433},${y + size / 4}`,
        `${x - size * 0.433},${y - size / 4}`,
      ].join(" ");
      hexes.push(pts);
    }
  }

  return (
    <>
      {hexes.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="var(--border)"
          strokeWidth="0.1"
          opacity="0.15"
        />
      ))}
    </>
  );
}

function NoiseOverlay() {
  return (
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.03 0" />
    </filter>
  );
}
