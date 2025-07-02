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
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
