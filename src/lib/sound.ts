// Single shared intro-voice player. The nav toggle and the hero "Hear my intro"
// button both control this one <audio>, so they always stay in sync.
import { useEffect, useState } from "react";

// Drop public/intro.mp3 or public/intro.wav to enable the intro.
const EXTS = ["mp3", "wav"];

let el: HTMLAudioElement | null = null;
let probe: Promise<HTMLAudioElement | null> | null = null;
let playing = false;
let progress = 0; // 0..1
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

/** Finds the intro file once (client only) and builds the audio element. */
export function loadIntro(): Promise<HTMLAudioElement | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  probe ??= (async () => {
    for (const ext of EXTS) {
      const url = `${import.meta.env.BASE_URL}intro.${ext}`;
      try {
        const r = await fetch(url, { method: "HEAD" });
        if (!r.ok || !(r.headers.get("content-type") ?? "").startsWith("audio")) continue;
        const a = new Audio(url);
        a.preload = "auto";
        a.addEventListener("play", () => { playing = true; emit(); });
        a.addEventListener("pause", () => { playing = false; emit(); });
        a.addEventListener("ended", () => { playing = false; progress = 0; emit(); });
        a.addEventListener("timeupdate", () => {
          progress = a.duration ? a.currentTime / a.duration : 0;
          emit();
        });
        el = a;
        emit();
        return a;
      } catch {
        /* try next format */
      }
    }
    return null;
  })();
  return probe;
}

/** Play or pause the intro. Must be called from a user gesture. */
export function toggleIntro() {
  const a = el;
  if (!a) return;
  if (playing) {
    a.pause();
    return;
  }
  if (a.ended) a.currentTime = 0;
  a.play().catch(() => { playing = false; emit(); });
}

/** React hook: { available, playing, progress } for the intro audio. */
export function useIntro() {
  const [, tick] = useState(0);
  useEffect(() => {
    const f = () => tick((n) => n + 1);
    subs.add(f);
    void loadIntro();
    f();
    return () => { subs.delete(f); };
  }, []);
  return { available: el !== null, playing, progress };
}
