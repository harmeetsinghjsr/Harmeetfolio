import { useEffect, useRef, useState } from "react";
import { useReduced } from "@/lib/motion";
import { isTouchDevice } from "@/lib/device";

type Point = { x: number; y: number };
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  tone: 0 | 1;
  trail: Point[];
};

const TRAIL_LENGTH = 7;

function createParticle(width: number, height: number, index: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    size: 0.7 + Math.random() * 1.8,
    tone: index % 5 === 0 ? 1 : 0,
    trail: [],
  };
}

export function CursorField() {
  const reduced = useReduced();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!reduced);
  }, [reduced]);

  useEffect(() => {
    if (!enabled || !canvas.current) return;
    const element = canvas.current;
    const context = element.getContext("2d");
    if (!context) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let raf = 0;
    let last = performance.now();
    let pointerSeen = false;
    const touch = isTouchDevice();
    let lastInput = 0;
    let lastScroll = window.scrollY;
    let scrollKick = 0;
    const pointer = { x: width * 0.72, y: height * 0.42 };
    const particles = Array.from({ length: width < 900 ? 42 : 78 }, (_, index) =>
      createParticle(width, height, index),
    );

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      element.width = Math.floor(width * dpr);
      element.height = Math.floor(height * dpr);
      element.style.width = `${width}px`;
      element.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointerSeen = true;
      lastInput = performance.now();
    };
    // Touch: the swarm follows the finger, then relaxes once it lifts.
    const onTouch = (event: TouchEvent) => {
      const t = event.touches[0];
      if (!t) return;
      pointer.x = t.clientX;
      pointer.y = t.clientY;
      pointerSeen = true;
      lastInput = performance.now();
    };
    // Scrolling streams the particles past like a starfield.
    const onScroll = () => {
      const y = window.scrollY;
      scrollKick += Math.max(-40, Math.min(40, y - lastScroll));
      lastScroll = y;
    };
    const drawTrail = (particle: Particle) => {
      if (particle.trail.length < 2) return;
      context.lineWidth = particle.size * 0.7;
      for (let index = 1; index < particle.trail.length; index += 1) {
        const from = particle.trail[index - 1];
        const to = particle.trail[index];
        const opacity = (index / particle.trail.length) * 0.18;
        context.strokeStyle =
          particle.tone === 1
            ? `rgba(245, 160, 106, ${opacity})`
            : `rgba(141, 232, 211, ${opacity})`;
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
      }
    };
    const draw = (now: number) => {
      const delta = Math.min((now - last) / 16.67, 2);
      last = now;
      context.clearRect(0, 0, width, height);
      const sinceInput = now - lastInput;
      const influence = !pointerSeen
        ? 0.2
        : touch
          ? Math.max(0.2, 1 - sinceInput / 1600)
          : 1;
      const kick = scrollKick * 0.018 * delta;
      scrollKick *= 0.86;

      for (const particle of particles) {
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const distance = Math.max(42, Math.hypot(dx, dy));
        const pull = Math.min(0.22, (260 / (distance * distance)) * influence) * delta;
        const swirl = Math.min(0.09, 6 / distance) * influence * delta;
        particle.vx += (dx / distance) * pull - (dy / distance) * swirl;
        particle.vy += (dy / distance) * pull + (dx / distance) * swirl;
        particle.vy -= kick * (0.6 + particle.size * 0.4);
        particle.vx *= 0.985;
        particle.vy *= 0.985;
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;

        if (particle.x < -24) particle.x = width + 24;
        if (particle.x > width + 24) particle.x = -24;
        if (particle.y < -24) particle.y = height + 24;
        if (particle.y > height + 24) particle.y = -24;

        particle.trail.push({ x: particle.x, y: particle.y });
        if (particle.trail.length > TRAIL_LENGTH) particle.trail.shift();
        drawTrail(particle);

        context.fillStyle =
          particle.tone === 1 ? "rgba(245, 160, 106, 0.55)" : "rgba(141, 232, 211, 0.5)";
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      if (pointerSeen && influence > 0.25) {
        const halo = context.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          92,
        );
        halo.addColorStop(0, `rgba(141, 232, 211, ${(touch ? 0.14 : 0.08) * influence})`);
        halo.addColorStop(1, "rgba(141, 232, 211, 0)");
        context.fillStyle = halo;
        context.beginPath();
        context.arc(pointer.x, pointer.y, 92, 0, Math.PI * 2);
        context.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={canvas} className="cursor-field" aria-hidden />;
}
