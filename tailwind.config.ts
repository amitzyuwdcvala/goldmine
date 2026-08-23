import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "420px",
      },
      colors: {
        vault: {
          950: "#0A0906",
          900: "#100E09",
          800: "#1B180F",
          700: "#272216",
          600: "#3A3323",
        },
        parchment: {
          50: "#F7F3E8",
          100: "#EFE9D8",
          200: "#DDD3B4",
        },
        bullion: {
          400: "#E8C766",
          500: "#D4AF37",
          600: "#B8860B",
          700: "#8C6A16",
        },
        ember: "#9A5B33",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
        body: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jbmono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        "vault-mesh":
          "radial-gradient(circle at 15% 0%, rgba(212,175,55,0.10), transparent 45%), radial-gradient(circle at 85% 100%, rgba(184,134,11,0.08), transparent 50%)",
        "sheen": "linear-gradient(115deg, transparent 20%, rgba(232,199,102,0.10) 40%, rgba(232,199,102,0.18) 50%, rgba(232,199,102,0.10) 60%, transparent 80%)",
      },
      boxShadow: {
        vault: "0 1px 0 0 rgba(232,199,102,0.08) inset, 0 20px 60px -20px rgba(0,0,0,0.7)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 30px -14px rgba(0,0,0,0.6)",
      },
      keyframes: {
        sheenmove: {
          "0%": { backgroundPosition: "-150% 0" },
          "100%": { backgroundPosition: "150% 0" },
        },
        ticktap: {
          "0%": { opacity: "0.4", transform: "translateY(2px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        sheenmove: "sheenmove 6s linear infinite",
        ticktap: "ticktap 0.4s ease-out",
        pulseDot: "pulseDot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
