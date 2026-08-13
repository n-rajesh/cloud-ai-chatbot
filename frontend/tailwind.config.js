/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          deep: "#020617",
          surface: "#0F172A",
        },
        brand: {
          cyan: "#00E5FF",
          purple: "#7C3AED",
          pink: "#FF4D9D",
        },
        state: {
          success: "#22C55E",
          warning: "#FACC15",
          error: "#EF4444",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(0, 229, 255, 0.35)",
        "glow-purple": "0 0 24px rgba(124, 58, 237, 0.35)",
        "glow-pink": "0 0 24px rgba(255, 77, 157, 0.35)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        aurora: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(4%, -6%) scale(1.08)" },
          "66%": { transform: "translate(-4%, 4%) scale(0.96)" },
        },
        "grid-pan": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "80px 80px" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: 0.6, filter: "blur(40px)" },
          "50%": { opacity: 1, filter: "blur(56px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "typing-dot": {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.4 },
          "40%": { transform: "scale(1)", opacity: 1 },
        },
      },
      animation: {
        aurora: "aurora 18s ease-in-out infinite",
        "grid-pan": "grid-pan 12s linear infinite",
        "pulse-glow": "pulse-glow 6s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
        "typing-dot": "typing-dot 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
