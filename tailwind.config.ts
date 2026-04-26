import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        first: {
          "0%": { transform: "translate(0%, 0%) rotate(0deg)" },
          "33%": { transform: "translate(5%, -10%) rotate(120deg)" },
          "66%": { transform: "translate(-5%, 5%) rotate(240deg)" },
          "100%": { transform: "translate(0%, 0%) rotate(360deg)" },
        },
        second: {
          "0%": { transform: "translate(0%, 0%) rotate(0deg)" },
          "33%": { transform: "translate(-5%, 10%) rotate(-120deg)" },
          "66%": { transform: "translate(10%, -5%) rotate(-240deg)" },
          "100%": { transform: "translate(0%, 0%) rotate(-360deg)" },
        },
        third: {
          "0%": { transform: "translate(0%, 0%) rotate(0deg)" },
          "33%": { transform: "translate(10%, 5%) rotate(120deg)" },
          "66%": { transform: "translate(-10%, -10%) rotate(240deg)" },
          "100%": { transform: "translate(0%, 0%) rotate(360deg)" },
        },
        fourth: {
          "0%": { transform: "translate(0%, 0%) rotate(0deg)" },
          "33%": { transform: "translate(-10%, -5%) rotate(-120deg)" },
          "66%": { transform: "translate(5%, 10%) rotate(-240deg)" },
          "100%": { transform: "translate(0%, 0%) rotate(-360deg)" },
        },
        fifth: {
          "0%": { transform: "translate(0%, 0%) rotate(0deg)" },
          "33%": { transform: "translate(5%, 10%) rotate(120deg)" },
          "66%": { transform: "translate(-5%, -10%) rotate(240deg)" },
          "100%": { transform: "translate(0%, 0%) rotate(360deg)" },
        },
      },
      animation: {
        first: "first 10s linear infinite",
        second: "second 12s linear infinite",
        third: "third 9s linear infinite",
        fourth: "fourth 11s linear infinite",
        fifth: "fifth 13s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
