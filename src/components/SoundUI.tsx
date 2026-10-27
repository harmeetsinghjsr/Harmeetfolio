import { useEffect, useRef, useState } from "react";
import { isSoundOn, routeMedia, setSound, subscribeSound } from "@/lib/sound";
import { btn } from "@/components/ui-bits";

export function useSoundOn() {
  const [v, setV] = useState(false);
  useEffect(() => { setV(isSoundOn()); return subscribeSound(setV); }, []);
  return v;
}

export function SoundToggle() {
  const on = useSoundOn();
  return (
    <button aria-label={on ? "Turn sound off" : "Turn sound on"} aria-pressed={on} onClick={() => setSound(!on)}
      className="flex size-11 items-end justify-center gap-[3px] rounded-full border border-border px-2 pb-2 pt-2 transition hover:border-primary">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={`w-[3px] rounded-full bg-primary ${on ? "eq-bar" : ""}`} style={{ height: on ? undefined : 3, animationDelay: `${i * 0.15}s` }} />
      ))}
    </button>
  );
}

const TRANSCRIPT = "Hi, I'm Harmeet, a software developer from Jamshedpur. I build full-stack apps, AI features, and automation that keeps running after I log off. Fun fact: this voice was generated with Resonance, the AI voice platform I deploy and run. Have a look around, and say hi.";
const SENTENCES = TRANSCRIPT.match(/[^.!?]+[.!?]+/g)!.map((s) => s.trim());
const EXTS = ["mp3", "m4a", "wav", "ogg", "webm", "aac"];

export function IntroButton() {
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(-1);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let dead = false;
    (async () => {
      for (const e of EXTS) {
        try {
          const r = await fetch(`/intro.${e}`, { method: "HEAD" });
          if (r.ok && (r.headers.get("content-type") ?? "").startsWith("audio")) { if (!dead) setSrc(`/intro.${e}`); return; }
        } catch { /* next */ }
      }
    })();
    return () => { dead = true; };
  }, []);

  if (!src) return null;

  const onTime = () => {
    const a = audio.current;
    if (!a || !a.duration) return;
    const total = SENTENCES.reduce((n, s) => n + s.length, 0);
    let acc = 0, t = a.currentTime / a.duration;
    for (let i = 0; i < SENTENCES.length; i++) { acc += SENTENCES[i]!.length / total; if (t <= acc) { setIdx(i); return; } }
  };

  const toggle = () => {
    const a = audio.current!;
    if (playing) { a.pause(); return; }
    routeMedia(a);
    a.currentTime = a.ended ? 0 : a.currentTime;
    void a.play();
  };

  return (
    <div className="mt-6 max-w-xl">
      <audio ref={audio} src={src} preload="auto" crossOrigin="anonymous" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); setIdx(-1); }} onTimeUpdate={onTime} />
      <button onClick={toggle} className={btn.small}>{playing ? "❚❚ Pause intro" : "▶ Hear my intro"}</button>
      {(playing || idx >= 0) && (
        <p className="mt-3 text-sm leading-relaxed">
          {SENTENCES.map((s, i) => <span key={i} className={`transition-colors duration-300 ${i === idx ? "text-foreground" : "text-muted-foreground/50"}`}>{s} </span>)}
        </p>
      )}
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Voice generated with Resonance</p>
    </div>
  );
}
