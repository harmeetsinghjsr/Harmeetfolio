// Web Audio engine: ambient drone + intro voice, all routed through one analyser.
import { useEffect, useState } from "react";

const KEY = "sound-on";
const DRONE_DB = -24;
const FADE = 1.5;

let ctx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let droneGain: GainNode | null = null;
let data: Uint8Array<ArrayBuffer> | null = null;
let level = 0;
let on = false;
const subs = new Set<(v: boolean) => void>();
const levelSubs = new Set<(v: number) => void>();

function ensure() {
  if (ctx) return ctx;
  ctx = new AudioContext();
  analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;
  data = new Uint8Array(analyser.frequencyBinCount);
  analyser.connect(ctx.destination);

  droneGain = ctx.createGain();
  droneGain.gain.value = 0;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  filter.Q.value = 6;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoAmt = ctx.createGain();
  lfoAmt.gain.value = 260;
  lfo.connect(lfoAmt).connect(filter.frequency);
  for (const [f, type] of [[55, "sawtooth"], [55.6, "triangle"]] as const) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.connect(filter);
    o.start();
  }
  lfo.start();
  filter.connect(droneGain).connect(analyser);
  return ctx;
}

function fadeTo(v: number) {
  if (!ctx || !droneGain) return;
  const t = ctx.currentTime, g = droneGain.gain;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(v, t + FADE);
}

export function isSoundOn() { return on; }
export function savedPreference() {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}
export function subscribeSound(fn: (v: boolean) => void) { subs.add(fn); return () => { subs.delete(fn); }; }

/** Must be called from a user gesture. */
export function setSound(v: boolean) {
  on = v;
  try { localStorage.setItem(KEY, v ? "1" : "0"); } catch { /* ignore */ }
  if (v) { const c = ensure(); void c.resume(); fadeTo(Math.pow(10, DRONE_DB / 20)); }
  else fadeTo(0);
  subs.forEach((f) => f(v));
}

/** Smoothed low-frequency energy, 0..1. Call once per frame or via useAudioLevel. */
export function audioLevel() {
  if (!analyser || !data) return (level *= 0.9);
  analyser.getByteFrequencyData(data);
  let s = 0;
  for (let i = 1; i < 10; i++) s += data[i]!;
  const target = Math.min(1, (s / 9 / 255) * 1.6);
  level += (target - level) * 0.2;
  if (on) levelSubs.forEach((f) => f(level));
  return level;
}

/** React hook: returns { level, on } — re-renders on audio level changes. */
export function useAudioLevel() {
  const [l, setL] = useState(level);
  const [, setOn] = useState(on);
  useEffect(() => {
    return subs.add(setOn);
  }, []);
  useEffect(() => {
    const id = setInterval(() => setL(level), 16);
    return () => clearInterval(id);
  }, []);
  return { level: l, on };
}

/** Routes an <audio> element through the analyser (once per element). */
const routed = new WeakSet<HTMLMediaElement>();
export function routeMedia(el: HTMLMediaElement) {
  const c = ensure();
  void c.resume();
  if (routed.has(el)) return;
  routed.add(el);
  c.createMediaElementSource(el).connect(analyser!);
}


