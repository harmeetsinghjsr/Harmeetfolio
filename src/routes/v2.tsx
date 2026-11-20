import { createFileRoute } from "@tanstack/react-router";
import v2Css from "../v2/v2.css?url";
import { V2 } from "../v2/V2";

export const Route = createFileRoute("/v2")({
  head: () => ({
    meta: [
      { title: "Harmeet Singh — Software Developer" },
      {
        name: "description",
        content:
          "Harmeet Singh builds AI products, automation and cloud systems that keep working after he logs off.",
      },
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
