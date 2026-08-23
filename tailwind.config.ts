import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "400px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
      colors: {
        // Starbucks Four-Tier Green Brand System
        sb: {
          green: "#006241",       // Starbucks Green (headings, brand moments)
          accent: "#00754A",      // Green Accent (primary filled CTAs, Frap button)
          house: "#1E3932",       // House Green (deep near-black hero bands, footers)
          uplift: "#2B5148",      // Green Uplift (mid-dark accents)
          light: "#D4E9E2",       // Green Light (mint wash, valid tints, chips)
          dark: "#122520",        // Deepest House Green

          // Gold Rewards & Karat Accent System
          gold: "#CBA258",        // Gold (Rewards ceremony, 24K bullion badge)
          "gold-light": "#DFC49D",
          "gold-lightest": "#FAF6EE",

          // Neutral Canvases & Surfaces
          canvas: "#F2F0EB",      // Neutral Warm Primary Canvas (warm cream, café napkins)
          ceramic: "#EDEBE9",     // Ceramic Off-White (zone separators, soft washes)
          cool: "#F9F9F9",        // Neutral Cool
          card: "#FFFFFF",        // White Card Surface
          border: "#D6DBDE",
          "border-subtle": "#E5E3DD",

          // Semantic
          red: "#C82014",
          "red-tint": "#FDE8E7",
          yellow: "#FBBC05",
        },

        // Text Scales
        ink: {
          DEFAULT: "rgba(0, 0, 0, 0.87)", // Text Black (warm 87%)
          soft: "rgba(0, 0, 0, 0.58)",    // Text Black Soft (58%)
          muted: "rgba(0, 0, 0, 0.38)",   // Text Black Muted (38%)
          faint: "rgba(0, 0, 0, 0.16)",
        },
        chalk: {
          DEFAULT: "#FFFFFF",
          soft: "rgba(255, 255, 255, 0.75)",
          muted: "rgba(255, 255, 255, 0.45)",
          faint: "rgba(255, 255, 255, 0.15)",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Iowan Old Style", "Georgia", "serif"],
        sans: ["var(--font-inter)", "SoDoSans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-jbmono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        tight: "-0.01em", // Signature Starbucks -0.01em tracking
        loose: "0.1em",
        looser: "0.15em",
      },
      borderRadius: {
        pill: "50px",     // Universal 50px pill button radius
        card: "12px",     // Universal 12px content card radius
      },
      boxShadow: {
        // Starbucks whisper-soft layered shadow stacks
        "sb-card": "0 0 0.5px rgba(0,0,0,0.14), 0 1px 1px rgba(0,0,0,0.12), 0 4px 12px -2px rgba(0,0,0,0.04)",
        "sb-card-hover": "0 0 0.5px rgba(0,0,0,0.18), 0 3px 8px rgba(0,0,0,0.08), 0 12px 24px -4px rgba(0,0,0,0.06)",
        "sb-frap": "0 0 6px rgba(0,0,0,0.24), 0 8px 14px rgba(0,0,0,0.16)",
        "sb-nav": "0 1px 3px rgba(0,0,0,0.08), 0 2px 2px rgba(0,0,0,0.05), 0 0 2px rgba(0,0,0,0.06)",
        "sb-pill": "0 2px 6px -1px rgba(0,117,74,0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
