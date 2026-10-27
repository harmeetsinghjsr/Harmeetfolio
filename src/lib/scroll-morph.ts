import { useEffect, useRef } from "react";
import type { FormName } from "./universe";
import { isFormReady } from "./universe";

export interface SectionDefinition {
  id: string;
  form: FormName;
}

export function dispatchMorph(form: FormName): void {
  window.dispatchEvent(new CustomEvent("universe-morph", { detail: form }));
}

export function useSectionMorph(sections: SectionDefinition[]) {
  const activeSection = useRef<string>("hero");

  useEffect(() => {
    const elements = sections.map((s) => ({ ...s, el: document.getElementById(s.id) })).filter((s) => s.el);
    if (!elements.length) return;

    const handleScroll = () => {
      const viewportCenter = window.scrollY + window.innerHeight / 2;
      let best: SectionDefinition | null = null;
      let bestDist = Infinity;

      for (const { id, form, el } of elements) {
        const rect = el!.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2 + window.scrollY;
        const dist = Math.abs(elCenter - viewportCenter);
        if (dist < bestDist) {
          bestDist = dist;
          best = { id, form };
        }
      }

      if (best && best.id !== activeSection.current && bestDist < window.innerHeight * 0.6) {
        activeSection.current = best.id;
        if (isFormReady(best.form)) {
          dispatchMorph(best.form);
        } else {
          setTimeout(() => dispatchMorph(best.form), 50);
        }
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  return activeSection.current;
}
