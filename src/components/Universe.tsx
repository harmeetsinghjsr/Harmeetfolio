import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { audioLevel } from "@/lib/sound";
import { useReduced } from "@/lib/motion";
import {
  particleCount, startMorph, getForm, isFormReady, precomputeForms,
  setInitialForm, subscribe, explodeFromBang,
} from "@/lib/universe";
import type { FormName } from "@/lib/universe";
import { UniverseContext } from "@/lib/universe-context";

const vertexShader = `uniform float uTime;
uniform float uAudio;
uniform vec2 uMouse;
uniform vec2 uMouseVel;
uniform float uMouseAccel;
uniform float uScrollVel;
uniform float uScrollDir;
uniform float uParticleSize;
uniform float uScale;
uniform float uGlow;
uniform float uProgress;
uniform float uReduced;
uniform float uShockwave;
uniform vec2 uShockPos;
attribute vec3 aFrom;
attribute vec3 aTo;
attribute float aRandom;
varying vec3 vColor;
varying float vDepth;
varying float vVelocityMag;
varying float vAudio;

vec2 hash22(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.xy * 78933.37);
}

void main() {
  vec3 pos = mix(aFrom, aTo, smoothstep(0.0, 1.0, uProgress));

  // Shockwave ripple
  float sw = uShockwave;
  if (sw > 0.0) {
    vec2 d = pos.xy - uShockPos;
    float dist = length(d);
    if (dist < 2.5) {
      float wave = exp(-dist * 3.0) * (1.0 - dist * 0.3) * sw;
      pos.xy += normalize(d + vec2(0.001)) * wave;
    }
  }

  // Mouse velocity impulse
  vec2 toMouse = pos.xy - uMouse.xy * 3.0;
  float distMouse = length(toMouse);
  float mouseInfluence = exp(-distMouse * (1.0 + uMouseAccel * 3.0));
  float velMag = length(uMouseVel);
  vec2 repelDir = normalize(toMouse + vec2(0.001));
  float repelStrength = velMag > 0.01 ? velMag : -0.15;
  pos.xy += repelDir * repelStrength * mouseInfluence * 0.4 * (1.0 + uAudio * 0.5);

  // Scroll velocity displacement
  float scrollWave = sin(uTime * 5.483 + pos.x * 1.3 + pos.z * 0.7) * uScrollVel * 0.5;
  pos.y += scrollWave * (uScrollDir != 0.0 ? 1.0 : 0.0);

  // Audio-driven micro-oscillation
  float audioNoise = hash22(vec2(pos.x * 0.1, pos.z * 0.1) + uTime * 0.01).x;
  float audioOsc = sin(uTime * 20.0 + audioNoise * 6.283 + aRandom * 6.283) * uAudio * 0.1;
  pos.xy += vec2(audioOsc);

  // Reduced motion: snap to base form
  if (uReduced > 0.5) {
    pos = mix(aFrom, aTo, smoothstep(0.0, 1.0, uProgress));
  }

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float camDist = abs(mv.z);
  float distanceFade = 1.0 - smoothstep(5.0, 25.0, camDist);
  float sizeBoost = 1.0 + uAudio * 2.0;
  gl_PointSize = uParticleSize * sizeBoost * max(distanceFade, 0.2) * (1.0 + uAudio * 0.8);
  gl_PointSize = clamp(gl_PointSize, 1.0, 120.0);
  gl_Position = projectionMatrix * mv;

  vColor = mix(vec3(0.48, 0.55, 1.0), vec3(0.75, 0.5, 1.0), aRandom + uAudio * 0.3);
  vDepth = -mv.z;
  vVelocityMag = length(uMouseVel) * 0.3 + abs(uScrollVel) * 0.2;
  vAudio = uAudio;
}
`;

const fragmentShader = `uniform float uAudio;
uniform float uGlow;
uniform float uReduced;
varying vec3 vColor;
varying float vDepth;
varying float vVelocityMag;
varying float vAudio;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;

  float core = smoothstep(0.5, 0.0, d);
  float velocityAura = smoothstep(0.0, 0.4, vVelocityMag);
  float glow = exp(-d * 4.0) * (0.3 + uAudio * 1.2);
  float totalGlow = glow + velocityAura * 0.3;

  vec3 audioColorShift = vec3(1.0, 0.8 + uAudio * 0.4, 0.9 + uAudio * 0.3);
  float depthFade = 1.0 - smoothstep(15.0, 35.0, vDepth);

  vec3 finalColor = vColor * audioColorShift * (core + totalGlow) * uGlow;
  float finalAlpha = (core + totalGlow * 0.5) * depthFade * (0.7 + uAudio * 0.3);

  if (uReduced > 0.5) {
    finalColor *= 0.6;
    finalAlpha *= 0.7;
  }

  gl_FragColor = vec4(finalColor, finalAlpha);
}
`;

interface MouseState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  lastX: number;
  lastY: number;
  lastTime: number;
}

function useMouseVelocity(reduced: boolean): MouseState {
  const mouse = useRef<MouseState>({
    x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0,
    lastX: 0, lastY: 0, lastTime: 0,
  });

  useEffect(() => {
    if (reduced) return;
    const handleMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      const t = performance.now();
      const dt = Math.max(1, t - mouse.current.lastTime);
      const vx = (x - mouse.current.lastX) / dt;
      const vy = (y - mouse.current.lastY) / dt;
      const ax = (vx - mouse.current.vx) / dt;
      const ay = (vy - mouse.current.vy) / dt;
      mouse.current.lastX = x;
      mouse.current.lastY = y;
      mouse.current.vx = vx;
      mouse.current.vy = vy;
      mouse.current.ax = ax;
      mouse.current.ay = ay;
      mouse.current.x = x * 2 - 1;
      mouse.current.y = y * 2 - 1;
      mouse.current.lastTime = t;
    };
    const handleTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        const x = t.clientX / window.innerWidth;
        const y = t.clientY / window.innerHeight;
        const time = performance.now();
        const dt = Math.max(1, time - mouse.current.lastTime);
        const vx = (x - mouse.current.lastX) / dt;
        const vy = (y - mouse.current.lastY) / dt;
        mouse.current.lastX = x;
        mouse.current.lastY = y;
        mouse.current.vx = vx;
        mouse.current.vy = vy;
        mouse.current.x = x * 2 - 1;
        mouse.current.y = y * 2 - 1;
        mouse.current.lastTime = time;
      }
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("touchmove", handleTouch, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("touchmove", handleTouch);
    };
  }, [reduced]);

  return mouse.current;
}

function useScrollVelocity(): { vel: number; dir: number } {
  const scroll = useRef({ vel: 0, dir: 0, lastY: 0, lastTime: 0 });

  useEffect(() => {
    let rafId = 0;
    const update = () => {
      const y = window.scrollY;
      const t = performance.now();
      const dt = Math.max(1, t - scroll.current.lastTime);
      scroll.current.vel = Math.min(1, Math.abs(y - scroll.current.lastY) / dt * 3);
      scroll.current.dir = y > scroll.current.lastY ? 1 : -1;
      scroll.current.lastY = y;
      scroll.current.lastTime = t;
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return scroll.current;
}

const shaderUniforms = {
  uTime: { value: 0 },
  uAudio: { value: 0 },
  uMouse: { value: new THREE.Vector2(0, 0) },
  uMouseVel: { value: new THREE.Vector2(0, 0) },
  uMouseAccel: { value: 0 },
  uScrollVel: { value: 0 },
  uScrollDir: { value: 0 },
  uParticleSize: { value: 35 },
  uScale: { value: 800 },
  uGlow: { value: 1 },
  uProgress: { value: 1 },
  uReduced: { value: 0 },
  uShockwave: { value: 0 },
  uShockPos: { value: new THREE.Vector2(0, 0) },
};

function Points({ count, reduced, glow }: { count: number; reduced: boolean; glow: number }) {
  const ref = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { camera, invalidate, size } = useThree();
  const mouse = useMouseVelocity(reduced);
  const scrollVel = useScrollVelocity();
  const shockwaveRef = useRef<{ time: number; x: number; y: number } | null>(null);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const initial = getForm("galaxy") || getForm("bigbang")!;
    g.setAttribute("position", new THREE.BufferAttribute(initial, 3));
    g.setAttribute("aFrom", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aTo", new THREE.BufferAttribute(initial.slice(), 3));
    const rnd = new Float32Array(count);
    for (let i = 0; i < count; i++) rnd[i] = Math.random();
    g.setAttribute("aRandom", new THREE.BufferAttribute(rnd, 1));
    return g;
  }, [count]);

  useEffect(() => {
    const fromAttr = geo.getAttribute("aFrom") as THREE.BufferAttribute;
    const toAttr = geo.getAttribute("aTo") as THREE.BufferAttribute;
    return subscribe((from, to, eased) => {
      fromAttr.copyArray(from);
      toAttr.copyArray(to);
      fromAttr.needsUpdate = true;
      toAttr.needsUpdate = true;
      const m = mat.current;
      if (m) {
        (m.uniforms as any).uProgress.value = eased;
      }
    });
  }, [geo]);

  useEffect(() => {
    if (reduced) { invalidate(); return; }
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a,button,input,textarea')) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      shockwaveRef.current = { time: 0, x: nx, y: ny };
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [reduced, invalidate]);

  useFrame((state, delta) => {
    const m = mat.current;
    if (!m) return;
    const u = m.uniforms as any;
    u.uTime.value = state.clock.elapsedTime;
    u.uAudio.value = reduced ? audioLevel() * 0.3 : audioLevel();
    u.uMouse.value.set(mouse.x, mouse.y);
    u.uMouseVel.value.set(mouse.vx * 100, mouse.vy * 100);
    u.uMouseAccel.value = Math.min(1, Math.abs(mouse.ax * 50) + Math.abs(mouse.ay * 50));
    u.uScrollVel.value = scrollVel.vel;
    u.uScrollDir.value = scrollVel.dir;
    u.uGlow.value = glow;
    u.uParticleSize.value = size.height * 0.5 * state.viewport.dpr;
    u.uReduced.value = reduced ? 1 : 0;
    u.uScale.value = size.height * 0.5 * state.viewport.dpr;

    const sw = shockwaveRef.current;
    if (sw) {
      sw.time += delta;
      if (sw.time < 1.2) {
        u.uShockwave.value = Math.sin(sw.time * Math.PI / 1.2) * 0.5;
        u.uShockPos.value.set(sw.x, sw.y);
      } else {
        shockwaveRef.current = null;
        u.uShockwave.value = 0;
      }
    }

    if (reduced || !ref.current) return;
    ref.current.rotation.y += delta * 0.03;
    const p = Math.min(window.scrollY / window.innerHeight, 1);
    const k = 1 - Math.exp(-3 * delta);
    camera.position.x += (mouse.x * 0.8 - camera.position.x) * k;
    camera.position.y += (3.2 - mouse.y * 0.5 - p * 2.6 - camera.position.y) * k;
    camera.position.z += (7 - p * 5.5 - camera.position.z) * k;
    camera.lookAt(0, 0, 0);
  });

  return (
    <points ref={ref} geometry={geo} rotation={[0.25, 0, 0.1]}>
      <shaderMaterial
        ref={mat}
        args={[{ uniforms: shaderUniforms, vertexShader, fragmentShader }]}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        transparent
        vertexColors
      />
    </points>
  );
}

export function triggerBigBang(): void {
  explodeFromBang();
}

export function triggerMorph(form: FormName): void {
  startMorph(form);
}

export default function Universe({ onReady }: { onReady?: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [showCanvas, setShowCanvas] = useState(false);
  const [morphTarget, setMorphTarget] = useState<FormName>("galaxy");
  const reduced = useReduced();
  const count = useMemo(() => particleCount(), []);

  useEffect(() => {
    let ticks = 0;
    const check = () => {
      if (isFormReady("galaxy") && isFormReady("bigbang")) {
        setShowCanvas(true);
        setInitialForm("galaxy");
        startMorph("galaxy");
        onReady?.();
        return;
      }
      ticks++;
      if (ticks < 60) setTimeout(check, 50);
      else { setShowCanvas(true); setInitialForm("galaxy"); startMorph("galaxy"); onReady?.(); }
    };
    precomputeForms();
    check();
  }, [onReady]);

  useEffect(() => {
    const el = wrap.current?.parentElement;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting));
    io.observe(el);
    if (reduced) return () => io.disconnect();
    const onScroll = () => setOpacity(Math.max(0, 1 - window.scrollY / (window.innerHeight * 0.9)));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const handler = (e: CustomEvent<FormName>) => {
      setMorphTarget(e.detail);
      startMorph(e.detail);
    };
    window.addEventListener("universe-morph", handler as EventListener);
    return () => window.removeEventListener("universe-morph", handler as EventListener);
  }, [reduced]);

  return (
    <div ref={wrap} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity }}>
      {showCanvas && (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 3.2, 7], fov: 60 }}
          frameloop={reduced ? "demand" : visible ? "always" : "never"}
          gl={{ antialias: false, alpha: true }}
        >
          <Points count={count} reduced={reduced} glow={count < 12000 ? 0 : 1} />
          <UniverseContext.Provider value={{
            morphTo: (form: FormName) => {
              const evt = new CustomEvent("universe-morph", { detail: form });
              window.dispatchEvent(evt);
            },
            ready: isFormReady,
            current: morphTarget,
          }} />
        </Canvas>
      )}
    </div>
  );
}
