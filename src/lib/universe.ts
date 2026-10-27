import * as THREE from "three";

const PARTICLES = { desktop: 40000, tablet: 20000, phone: 10000 };
const DURATION = 1.6; // seconds for full morph

export type FormName = "bigbang" | "galaxy" | "constellation" | "pipeline" | "orbits" | "nebula" | "letsTalk";

const subs = new Set<(from: Float32Array, to: Float32Array, eased: number) => void>();

interface UniverseCtx {
  count: number;
  forms: Map<FormName, Float32Array>;
  ready: Set<FormName>;
  current: FormName | null;
  from: Float32Array | null;
  to: Float32Array | null;
  progress: number;
  startTime: number;
  raf: number;
}

const ctx: UniverseCtx = {
  count: 0,
  forms: new Map<FormName, Float32Array>(),
  ready: new Set<FormName>(),
  current: null,
  from: null,
  to: null,
  progress: 1,
  startTime: 0,
  raf: 0,
};

export function particleCount(): number {
  if (ctx.count) return ctx.count;
  const w = window.innerWidth;
  const c = navigator.hardwareConcurrency || 4;
  if (w < 480 || c <= 2) ctx.count = PARTICLES.phone;
  else if (w < 1024 || c <= 4) ctx.count = PARTICLES.tablet;
  else ctx.count = PARTICLES.desktop;
  return ctx.count;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function formBigBang(count: number): Float32Array {
  return new Float32Array(count * 3);
}

export function formGalaxy(count: number): Float32Array {
  const p = new Float32Array(count * 3);
  const branches = 4;
  const radius = 6;
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 1.6) * radius;
    const angle = ((i % branches) / branches) * Math.PI * 2 + r * 0.9;
    const rnd = () => Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 * (1 + r * 0.3);
    p[i * 3] = Math.cos(angle) * r + rnd();
    p[i * 3 + 1] = rnd() * 0.4;
    p[i * 3 + 2] = Math.sin(angle) * r + rnd();
  }
  return p;
}

function faSet(p: Float32Array, i: number, v: number): void {
  p[i] = v;
}

export function formConstellation(count: number): Float32Array {
  const p = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    p[i * 3] = (Math.random() - 0.5) * 30;
    p[i * 3 + 1] = (Math.random() - 0.5) * 16;
    p[i * 3 + 2] = (Math.random() - 0.5) * 4;
  }
  return p;
}

export function formPipeline(count: number): Float32Array {
  const p = new Float32Array(count * 3);
  const nodes = 5;
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const clusterIdx = Math.floor(t * nodes);
    const clusterT = (t * nodes) - clusterIdx;
    const cx = (clusterIdx / nodes - 0.5) * 20;
    const cy = Math.sin(clusterT * Math.PI) * 3 + (clusterIdx - nodes / 2) * 1.5;
    const r = Math.pow(Math.random(), 2) * 1.6;
    const a = Math.random() * Math.PI * 2;
    p[i * 3] = cx + Math.cos(a) * r;
    p[i * 3 + 1] = cy + Math.sin(a) * r * 0.5;
    p[i * 3 + 2] = (Math.random() - 0.5) * 2;
  }
  return p;
}

export function formOrbits(count: number): Float32Array {
  const p = new Float32Array(count * 3);
  const rings = 3;
  const ringRadius = [2.2, 3.6, 5.2];
  const ringTilt = [0.3, -0.2, 0.5];
  for (let i = 0; i < count; i++) {
    const ring = i % rings;
    const t = (i / count) * rings * Math.PI * 2;
    const r = ringRadius[ring]!;
    const x = Math.cos(t) * r;
    const z = Math.sin(t) * r;
    const y = ringTilt[ring]! * Math.sin(t * 2);
    p[i * 3] = x;
    p[i * 3 + 1] = y;
    p[i * 3 + 2] = z;
  }
  return p;
}

export function formNebula(count: number): Float32Array {
  const p = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random() - 0.5;
    const v = Math.random() - 0.5;
    const r = Math.sqrt(u * u + v * v);
    const a = Math.atan2(v, u);
    const radius = r * 8 * (1 - r * 0.3);
    p[i * 3] = Math.cos(a) * radius;
    p[i * 3 + 1] = (Math.random() - 0.5) * r * 3;
    p[i * 3 + 2] = Math.sin(a) * radius;
  }
  return p;
}

export function formLetsTalk(count: number): Float32Array {
  const p = new Float32Array(count * 3);
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 120;
  const ctx2 = canvas.getContext("2d")!;
  ctx2.font = "bold 80px 'Space Grotesk', sans-serif";
  ctx2.fillStyle = "#ffffff";
  ctx2.textBaseline = "middle";
  ctx2.textAlign = "center";
  ctx2.fillText("LET'S TALK", 200, 60);
  const img = ctx2.getImageData(0, 0, 400, 120).data;
  const pts: [number, number][] = [];
  const step = Math.floor((400 * 120) / count);
  for (let i = 0; i < img.length; i += step * 4) {
    if ((img[i + 3] ?? 0) > 0) {
      const px = (i / 4) % 400;
      const py = Math.floor((i / 4) / 400);
      pts.push([px, py]);
    }
  }
  for (let i = 0; i < count; i++) {
    const pt = pts[i % pts.length]!;
    p[i * 3] = ((pt[0] / 400) - 0.5) * 16;
    p[i * 3 + 1] = ((pt[1] / 120) - 0.5) * 6;
    p[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
  }
  return p;
}

const FORM_BUILDERS: Record<string, (n: number) => Float32Array> = {
  bigbang: formBigBang,
  galaxy: formGalaxy,
  constellation: formConstellation,
  pipeline: formPipeline,
  orbits: formOrbits,
  nebula: formNebula,
  letsTalk: formLetsTalk,
};

export function precomputeForms(): void {
  const n = particleCount();
  const idle = (window as any).requestIdleCallback || ((cb: FrameRequestCallback) => setTimeout(cb, 16));
  const forms = Object.keys(FORM_BUILDERS);
  let i = 0;
  const next = () => {
    if (i >= forms.length) {
      // Notify subscribers that forms are ready
      if (ctx.from && ctx.to && ctx.current) {
        subs.forEach((f) => f(ctx.from!, ctx.to!, 1));
      }
      return;
    }
    const name = forms[i++] as FormName;
    idle(() => {
      const builder = FORM_BUILDERS[name];
      if (builder) {
          ctx.forms.set(name, builder(n));
        ctx.ready.add(name);
      }
      next();
    });
  };
  next();
}

export function getForm(name: FormName): Float32Array | null {
  return ctx.forms.get(name) || null;
}

export function isFormReady(name: FormName): boolean {
  return ctx.ready.has(name);
}

function tick() {
  if (ctx.to && ctx.from) {
    const elapsed = performance.now() - ctx.startTime;
    const progress = Math.min(1, elapsed / (DURATION * 1000));
    const eased = easeInOut(progress);
    subs.forEach((f) => f(ctx.from!, ctx.to!, eased));
    if (progress < 1) {
      ctx.raf = requestAnimationFrame(tick);
    } else {
      ctx.progress = 1;
      const copy = ctx.to.slice();
      ctx.from = ctx.to;
      ctx.to = copy;
      subs.forEach((f) => f(ctx.from!, ctx.to!, 1));
    }
  }
}

export function startMorph(name: FormName): void {
  const target = ctx.forms.get(name);
  if (!target) {
    setTimeout(() => startMorph(name), 100);
    return;
  }

  if (ctx.to && ctx.from && ctx.progress < 1) {
    const elapsed = performance.now() - ctx.startTime;
    const progress = Math.min(1, elapsed / (DURATION * 1000));
    const eased = easeInOut(progress);
    const blended = new Float32Array(ctx.count * 3);
    for (let i = 0; i < ctx.count * 3; i++) {
      blended[i] = THREE.MathUtils.lerp(ctx.from[i]!, ctx.to[i]!, eased);
    }
    ctx.from = blended;
  }

  ctx.to = target;
  ctx.startTime = performance.now();
  ctx.progress = 0;
  ctx.current = name;
  if (ctx.raf) cancelAnimationFrame(ctx.raf);
  ctx.raf = requestAnimationFrame(tick);
}

export function subscribe(fn: (from: Float32Array, to: Float32Array, eased: number) => void): () => void {
  subs.add(fn);
  if (ctx.from && ctx.to) {
    fn(ctx.from, ctx.to, ctx.progress >= 1 ? 1 : easeInOut(ctx.progress));
  }
  return () => subs.delete(fn);
}

export function explodeFromBang(): void {
  const galaxy = ctx.forms.get("galaxy");
  const bigbang = ctx.forms.get("bigbang") || formBigBang(ctx.count);
  if (!galaxy) return;
  ctx.from = bigbang.slice();
  ctx.to = galaxy;
  ctx.startTime = performance.now();
  ctx.progress = 0;
  ctx.current = "galaxy";
  if (ctx.raf) cancelAnimationFrame(ctx.raf);
  ctx.raf = requestAnimationFrame(tick);
}

export function setInitialForm(name: FormName): void {
  const form = ctx.forms.get(name);
  if (!form) return;
  const copy = form.slice();
  ctx.from = copy;
  ctx.to = copy;
  ctx.current = name;
  ctx.progress = 1;
  ctx.startTime = performance.now();
  subs.forEach((f) => f(ctx.from!, ctx.to!, 1));
}

export function updateProgressForFrame(delta: number): void {
  // Progress is driven by the tick() RAF, not external frame calls.
  // This is kept for API compatibility.
}

export function getMorphUniforms(): { from: Float32Array; to: Float32Array; progress: number; eased: number } {
  const from = ctx.from || ctx.to || getForm("bigbang")!;
  const to = ctx.to || from;
  return {
    from,
    to,
    progress: ctx.progress,
    eased: ctx.progress >= 1 ? 1 : easeInOut(ctx.progress),
  };
}
