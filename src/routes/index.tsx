import { createFileRoute } from "@tanstack/react-router";
import v2Css from "../v2/v2.css?url";
import { V2 } from "../v2/V2";
import { hero } from "@/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Harmeet Singh — Software Developer" },
      { name: "description", content: hero.subline },
      { property: "og:title", content: "Harmeet Singh — Software Developer" },
      { property: "og:description", content: hero.subline },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0b0a09" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600&display=swap",
      },
      { rel: "stylesheet", href: v2Css },
    ],
  }),
  component: V2,
});
