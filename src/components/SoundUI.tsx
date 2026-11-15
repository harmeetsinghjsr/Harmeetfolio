import { toggleIntro, useIntro } from "@/lib/sound";
import { btn } from "@/components/ui-bits";

// Nav button: plays / pauses the intro voice. Bars animate while it speaks.
export function SoundToggle() {
  const { available, playing } = useIntro();
  return (
    <button
      aria-label={playing ? "Pause intro" : "Play intro"}
      title={available ? (playing ? "Pause intro" : "Play intro") : "Intro audio unavailable"}
      aria-pressed={playing}
      disabled={!available}
      onClick={toggleIntro}
      className="flex size-11 items-end justify-center gap-[3px] rounded-full border border-border px-2 pb-2 pt-2 transition hover:border-primary disabled:opacity-40"
    >
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-primary ${playing ? "eq-bar" : ""}`}
          style={{ height: playing ? undefined : 3, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </button>
  );
}

const TRANSCRIPT =
  "Hi, I'm Harmeet, a software developer from Jamshedpur. I build full-stack apps, AI features, and automation that keeps running after I log off. Fun fact: this voice was generated with Resonance, the AI voice platform I deploy and run. Have a look around, and say hi.";
const SENTENCES = TRANSCRIPT.match(/[^.!?]+[.!?]+/g)!.map((s) => s.trim());

// Hero button + live transcript. Shares the same player as the nav toggle.
export function IntroButton() {
  const { available, playing, progress } = useIntro();
  if (!available) return null;

  const total = SENTENCES.reduce((n, s) => n + s.length, 0);
  let idx = -1;
  if (playing || progress > 0) {
    let acc = 0;
    for (let i = 0; i < SENTENCES.length; i++) {
      acc += SENTENCES[i]!.length / total;
      if (progress <= acc) { idx = i; break; }
    }
  }

  return (
    <div className="mt-6 max-w-xl">
      <button onClick={toggleIntro} className={btn.small}>
        {playing ? "❚❚ Pause intro" : "▶ Hear my intro"}
      </button>
      {idx >= 0 && (
        <p className="mt-3 text-sm leading-relaxed">
          {SENTENCES.map((s, i) => (
            <span
              key={i}
              className={`transition-colors duration-300 ${i === idx ? "text-foreground" : "text-muted-foreground/50"}`}
            >
              {s}{" "}
            </span>
          ))}
        </p>
      )}
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        Voice generated with Resonance
      </p>
    </div>
  );
}
