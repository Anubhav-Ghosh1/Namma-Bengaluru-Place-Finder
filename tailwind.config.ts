import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0A0E17",
        deep: "#0F172A",
        surface: "#1E293B",
        muted: "#334155",
        accent: {
          violet: "#8B5CF6",
          pink: "#EC4899",
          emerald: "#10B981",
          amber: "#F59E0B",
          red: "#EF4444",
          blue: "#3B82F6",
          teal: "#14B8A6",
        },
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        body: ["Noto Sans", "sans-serif"],
      },
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        shimmer: "shimmer 1.5s infinite",
        pulse2: "pulse2 2s infinite",
      },
      keyframes: {
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse2: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
