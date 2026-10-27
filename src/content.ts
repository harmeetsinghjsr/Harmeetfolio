// All site text and links live here. Edit freely.
export const profile = {
  name: "Harmeet Singh",
  email: "hs978698@gmail.com",
  github: "https://github.com/harmeetsinghjsr",
  linkedin: "https://www.linkedin.com/in/harmeetajimaljsr",
  location: "Jamshedpur, India",
  resume: "/Harmeetfolio/resume.pdf", // set to "" to fall back to LinkedIn
};

export const hero = {
  status: "Open to full-time roles",
  label: "Software Developer · Jamshedpur, India",
  headline: "I build software that keeps working after I log off.",
  subline:
    "Software Developer Intern at FixGenie, where I build and run a Python lead-generation and outreach pipeline. B.Tech CSE '26, Lovely Professional University.",
};

export type Project = {
  title: string;
  category: string;
  description: string;
  tags: string[];
  live?: string;
  code?: string;
  featured?: boolean;
  role?: string;
  problem?: string;
  solution?: string;
  architecture?: string;
  highlights?: string[];
};

export const projects: Project[] = [
  {
    title: "Resonance",
    category: "AI · Full-stack",
    description:
      "Built and productionized a multi-tenant AI text-to-speech platform: 20 voices with tunable generation controls, waveform playback and per-user history. Ran it on my own Clerk auth, Neon Postgres, Cloudflare R2 storage and Polar billing, and fixed a hydration bug, a dropped usage-metering call and sidebar UX issues.",
    tags: ["Next.js", "TypeScript", "tRPC", "Prisma", "Cloudflare R2"],
    live: "https://sarcastic-resonance.vercel.app",
    code: "https://github.com/harmeetsinghjsr/resonance",
    featured: true,
    role: "Production deployment · Full-stack engineering",
    problem:
      "Turn a promising AI voice product into a dependable, multi-tenant service with real auth, storage, billing, and usage history.",
    solution:
      "Reworked the deployment around Clerk, Neon, Cloudflare R2, and Polar while fixing hydration, usage-metering, and sidebar reliability issues.",
    architecture: "Next.js → tRPC → Prisma → Neon Postgres · R2 media storage · Polar billing",
    highlights: ["20 voices", "Per-user history", "Usage metering", "Production deployment"],
  },
  {
    title: "Cloud Browser",
    category: "Cloud · Serverless",
    description:
      "Paste any public URL and get its HTML back. A React + Vite front end on S3 static hosting calls API Gateway, which invokes a Node.js Lambda with least-privilege IAM; CloudWatch alarms track success rate, latency and errors.",
    tags: ["AWS Lambda", "API Gateway", "S3", "CloudWatch", "React"],
    role: "Cloud architecture · Serverless implementation",
    architecture:
      "S3 static app → API Gateway → Lambda → public URL response · CloudWatch telemetry",
  },
  {
    title: "MetaMask AI Query Interface",
    category: "AI · Web3",
    description:
      "Ask an Ethereum wallet questions in plain English. The OpenAI API interprets the question and routes it to the right read (balance or recent transactions) through ethers.js on the Sepolia testnet.",
    tags: ["React", "ethers.js", "OpenAI API", "MetaMask"],
    code: "https://github.com/harmeetsinghjsr/metamask-ai-agent",
    role: "AI interface · Web3 integration",
    architecture:
      "Natural-language prompt → OpenAI intent → ethers.js read → wallet-aware response",
  },
  {
    title: "Spam Email Detection Bot",
    category: "Machine Learning",
    description:
      "A supervised classifier comparing SVM and Logistic Regression on TF-IDF features, reaching about 96% accuracy on held-out data, wrapped in a desktop GUI for real-time checks.",
    tags: ["Python", "scikit-learn", "Pandas", "Tkinter"],
    code: "https://github.com/harmeetsinghjsr/CN127",
  },
  {
    title: "HarCoin",
    category: "Web3",
    description:
      "An ERC-20-style token on the Sepolia testnet with a React front end for MetaMask connection, live balances and transfers, including handling for wrong networks and rejected transactions.",
    tags: ["Solidity", "Hardhat", "ethers.js", "React"],
    live: "https://harcoin.surge.sh",
  },
  {
    title: "Harmflix",
    category: "Frontend",
    description:
      "A movie-discovery app with debounced TMDB search; an Appwrite backend counts searches and turns them into a live trending list.",
    tags: ["React", "Vite", "TMDB API", "Appwrite"],
    live: "https://harmflix.netlify.app",
    code: "https://github.com/harmeetsinghjsr/hahafirst",
  },
];

export const alsoBuilt: { title: string; description: string; live?: string; code?: string }[] = [
  {
    title: "BST Visualizer",
    description:
      "interactive binary-search-tree operations in JavaScript, plus an R/Shiny version.",
    live: "https://bstv.netlify.app",
    code: "https://github.com/harmeetsinghjsr/BSTV",
  },
  {
    title: "Health Analytics Dashboards for India",
    description: "R + Shiny dashboards covering 28+ states and 1,000+ data points.",
    code: "https://github.com/harmeetsinghjsr/RetailSalesDashboard",
  },
  {
    title: "Retail Sales Dashboard",
    description: "Power BI + DAX analysis of ₹276K+ in sales.",
    code: "https://github.com/harmeetsinghjsr/RetailSalesDashboard",
  },
  {
    title: "Rakshak",
    description:
      "Kotlin Android women's-safety app with SOS alerts, live location sharing and a safety timer.",
    code: "https://github.com/harmeetsinghjsr/Rakshak",
  },
  {
    title: "Smart Accident Detection Helmet",
    description:
      "Arduino with accelerometer, GPS and GSM; texts the rider's location when it detects a crash.",
  },
  { title: "Gesture-Controlled Car", description: "an Arduino car steered by hand gestures." },
];

export const experience = [
  {
    role: "Software Developer Intern",
    company: "FixGenie Consulting Inc",
    dates: "Sep 2026 – Present",
    location: "Remote (Ontario, Canada)",
    link: { label: "fixgenie.co", href: "https://fixgenie.co" },
    summary:
      "Building the company’s lead-generation engine and the marketing surface that turns it into a repeatable growth system.",
    impact: "Pipeline + site ownership",
    tools: ["Python", "n8n", "GitHub Actions", "Next.js", "Three.js"],
    bullets: [
      "Build and run the company's Python lead-generation and cold-email pipeline: it sources and validates B2B leads, de-duplicates them into a Google Sheets CRM with fuzzy matching, and sends personalized multi-step sequences with LLM-drafted openers that stop automatically on reply, unsubscribe or bounce.",
      "The pipeline runs on a schedule with n8n and GitHub Actions and stays CAN-SPAM/CASL compliant with unsubscribe handling and a suppression list.",
      "Build and operate fixgenie.co, the company's marketing site (Next.js, React, TypeScript, Tailwind CSS, Framer Motion, GSAP, Three.js), deployed through GitHub Actions.",
    ],
  },
  {
    role: "Intern, Quality Engineering & Assurance",
    company: "Cognizant Technology Solutions",
    dates: "Jan 2026 – May 2026",
    location: "Chennai",
    summary:
      "Turned a live travel-booking flow into a repeatable quality signal with maintainable browser automation.",
    impact: "3 booking flows automated",
    tools: ["Selenium", "Java", "TestNG", "Page Object Model"],
    bullets: [
      "Built a Selenium + Java + TestNG automation suite on the Page Object Model covering three flows of a live travel-booking app: cab booking with dynamic future dates, form-validation error capture and dropdown value extraction.",
    ],
  },
  {
    role: "Summer Training Intern",
    company: "Cipher Schools",
    dates: "Jun 2024 – Jul 2024",
    location: "Remote",
    summary:
      "Strengthened the algorithmic and object-oriented foundations that now support my production engineering work.",
    impact: "Core Java foundations",
    tools: ["Java", "OOP", "Algorithms", "Complexity analysis"],
    bullets: [
      "Core Java and object-oriented programming; implemented and analyzed sorting and searching algorithms and their complexity.",
    ],
  },
] as {
  role: string;
  company: string;
  dates: string;
  location: string;
  link?: { label: string; href: string };
  summary: string;
  impact: string;
  tools: string[];
  bullets: string[];
}[];

export const skills = [
  {
    id: "ai-automation",
    title: "AI & Automation",
    description: "LLM features and pipelines that run on a schedule.",
    signal: "ORCHESTRATION",
    relatedProjects: ["Resonance", "Spam Email Detection Bot"],
    relatedExperience: "FixGenie Consulting Inc",
    items: [
      "OpenAI API",
      "LLM integration",
      "Python",
      "Playwright",
      "n8n",
      "GitHub Actions",
      "scikit-learn",
      "Pandas",
    ],
  },
  {
    id: "full-stack",
    title: "Full-stack",
    description: "Typed web apps from database to UI.",
    signal: "PRODUCT SYSTEMS",
    relatedProjects: ["Resonance", "Cloud Browser", "Harmflix"],
    relatedExperience: "FixGenie Consulting Inc",
    items: [
      "Next.js",
      "React",
      "TypeScript",
      "tRPC",
      "Prisma",
      "PostgreSQL",
      "Clerk",
      "Node.js",
      "Tailwind CSS",
    ],
  },
  {
    id: "cloud-testing",
    title: "Cloud & Testing",
    description: "Serverless on AWS, tested and monitored.",
    signal: "RELIABILITY",
    relatedProjects: ["Cloud Browser", "MetaMask AI Query Interface"],
    relatedExperience: "Cognizant Technology Solutions",
    items: [
      "AWS Lambda",
      "API Gateway",
      "S3",
      "CloudWatch",
      "IAM",
      "Cloudflare R2",
      "Vercel",
      "Selenium",
      "TestNG",
      "Java",
    ],
  },
];
export const alsoWorkedWith = [
  "Solidity",
  "ethers.js",
  "Kotlin",
  "R + Shiny",
  "Power BI",
  "SQL",
  "Arduino",
  "Git",
  "Linux",
];

export const about = {
  bio: "I'm a Software Developer Intern at FixGenie Consulting, an Ontario-based company I work with remotely. I build and run its Python lead-generation and cold-email pipeline, and I build its marketing site, fixgenie.co. Before that I interned in Quality Engineering & Assurance at Cognizant, writing Selenium + Java test automation for a live travel-booking app. I graduated in 2026 with a B.Tech in Computer Science from Lovely Professional University. I started out wiring Arduino boards and worked my way up to cloud and AI; outside code, I follow aerospace and space exploration.",
  identity: {
    origin: "Jamshedpur, India",
    focus: "Reliable AI, automation, and cloud systems",
    currentSignal: "Building at FixGenie",
  },
  progression: [
    {
      label: "ORIGIN",
      value: "Arduino beginnings",
      detail: "Hardware, sensors, and the first instinct to make systems respond.",
    },
    {
      label: "EXPANSION",
      value: "Frontend → cloud → AI",
      detail: "Moving from interfaces into the infrastructure and automation behind them.",
    },
    {
      label: "NOW",
      value: "Reliable software",
      detail: "Building products and pipelines designed to keep working after launch.",
    },
  ],
  education: {
    degree: "B.Tech, Computer Science & Engineering",
    school: "Lovely Professional University",
    dates: "2022 – 2026",
    grade: "CGPA 7.66/10",
  },
  recognition: [
    "1st Rank — Leading Management Idea Hackathon, 2025 (200+ participants)",
    "7th Rank — Binary Blitz Hackathon, 2024 (5,000+ participants)",
    "1st Prize — National Science Exhibition, 2022",
  ],
};

export const contact = {
  title: "Have a system worth building?",
  line: "The fastest way to reach me is email. If the problem is interesting, I would like to hear about it.",
  status: "Channels open",
  availability: "Open to full-time software roles",
};
