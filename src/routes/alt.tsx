import { createFileRoute } from "@tanstack/react-router";
import v2Css from "../v2/v2.css?url";
import { V2 } from "../v2/V2";

const BASE = import.meta.env.BASE_URL;

// Same page as the homepage, with the alternate hero portrait (river photo).
function AltPage() {
  return (
    <V2
      portrait={{
        ascii: `${BASE}v2/portrait-alt-ascii.png`,
        reveal: `${BASE}v2/portrait-alt-reveal.webp`,
      }}
    />
  );
}

export const Route = createFileRoute("/alt")({
  head: () => ({
    meta: [
      { title: "Harmeet Singh — Software Developer (alt)" },
      { name: "robots", content: "noindex" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600&display=swap",
      },
      { rel: "stylesheet", href: v2Css },
    ],
  }),
  component: AltPage,
});
