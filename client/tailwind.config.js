/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tactical operations centre palette.
        bg: {
          base: "#0f1117",
          panel: "#151823",
          raised: "#1c2030",
          line: "#262a3a",
        },
        ink: {
          DEFAULT: "#e6e8ef",
          dim: "#9aa0b4",
          mute: "#5e6478",
        },
        urgent: {
          DEFAULT: "#ff8a3d", // amber/orange — urgency
          deep: "#c4541d",
          soft: "#ff8a3d22",
        },
        critical: {
          DEFAULT: "#ff4d4d", // red — critical
          soft: "#ff4d4d22",
        },
        safe: {
          DEFAULT: "#3ed0c4", // teal — safe / complete
          deep: "#1a8a82",
          soft: "#3ed0c422",
        },
        warn: {
          DEFAULT: "#f5c044",
          soft: "#f5c04422",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      keyframes: {
        pulseUrgent: {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(255, 77, 77, 0.55)",
          },
          "50%": {
            boxShadow: "0 0 0 6px rgba(255, 77, 77, 0)",
          },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        rowHighlight: {
          "0%": { backgroundColor: "rgba(62, 208, 196, 0.18)" },
          "100%": { backgroundColor: "transparent" },
        },
        scan: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "pulse-urgent": "pulseUrgent 1.6s ease-out infinite",
        "fade-in-up": "fadeInUp 0.35s ease-out both",
        "row-highlight": "rowHighlight 1.4s ease-out",
        scan: "scan 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
