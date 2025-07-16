// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}", // if you're using /app directory
    "./pages/**/*.{ts,tsx}", // if you're using /pages
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}", // optional if you use /src
  ],
  safelist: [
    "bg-red-700",
    "bg-orange-600",
    "bg-amber-700",
    "bg-yellow-700",
    "bg-lime-700",
    "bg-green-700",
    "bg-emerald-700",
    "bg-teal-700",
    "bg-cyan-700",
    "bg-blue-700",
    "bg-indigo-700",
    "bg-violet-700",
    "bg-purple-700",
    "bg-fuchsia-700",
    "bg-pink-700",
    "bg-rose-700",
    "bg-gray-700",
    "bg-neutral-700",
    "bg-zinc-700",
    "bg-slate-700",
    "animate-glitch-after",
    "animate-glitch-before",
  ],
  theme: {
    extend: {
      keyframes: {
        glitch: {
          "0%": { "clip-path": "inset(20% 0 50% 0)" },
          "5%": { "clip-path": "inset(10% 0 60% 0)" },
          "10%": { "clip-path": "inset(15% 0 55% 0)" },
          "15%": { "clip-path": "inset(25% 0 35% 0)" },
          "20%": { "clip-path": "inset(30% 0 40% 0)" },
          "25%": { "clip-path": "inset(40% 0 20% 0)" },
          "30%": { "clip-path": "inset(10% 0 60% 0)" },
          "35%": { "clip-path": "inset(15% 0 55% 0)" },
          "40%": { "clip-path": "inset(25% 0 35% 0)" },
          "45%": { "clip-path": "inset(30% 0 40% 0)" },
          "50%": { "clip-path": "inset(20% 0 50% 0)" },
          "55%": { "clip-path": "inset(10% 0 60% 0)" },
          "60%": { "clip-path": "inset(15% 0 55% 0)" },
          "65%": { "clip-path": "inset(25% 0 35% 0)" },
          "70%": { "clip-path": "inset(30% 0 40% 0)" },
          "75%": { "clip-path": "inset(40% 0 20% 0)" },
          "80%": { "clip-path": "inset(20% 0 50% 0)" },
          "85%": { "clip-path": "inset(10% 0 60% 0)" },
          "90%": { "clip-path": "inset(15% 0 55% 0)" },
          "95%": { "clip-path": "inset(25% 0 35% 0)" },
          "100%": { "clip-path": "inset(30% 0 40% 0)" },
        },
      },
      animation: {
        "glitch-after":
          "glitch var(--after-duration) infinite linear alternate-reverse",
        "glitch-before":
          "glitch var(--before-duration) infinite linear alternate-reverse",
      },
    },
  },
  plugins: [],
};

export default config;
