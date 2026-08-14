/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft, warm beige — primary backgrounds & surfaces
        beige: {
          50: "#FDFBF7",
          100: "#F8F2E9",
          200: "#F1E6D3",
          300: "#E7D5B8",
          400: "#D9BE93",
          500: "#C8A570",
          600: "#B08A54",
          700: "#8C6B40",
          800: "#6B4F30",
          900: "#4A3620",
          950: "#2E2113",
        },
        // Burnt orange / terracotta — CTAs, highlights, accents
        terracotta: {
          50: "#FDF3EE",
          100: "#FAE3D5",
          200: "#F3C4A6",
          300: "#EBA173",
          400: "#E1804A",
          500: "#C1622D",
          600: "#A34F23",
          700: "#833E1B",
          800: "#652F15",
          900: "#48210E",
          950: "#2C140A",
        },
        // Deep charcoal — primary text & dark surfaces
        charcoal: {
          50: "#F6F5F4",
          100: "#E8E5E2",
          200: "#D1CBC5",
          300: "#AFA69C",
          400: "#877B6E",
          500: "#645A4E",
          600: "#4A423A",
          700: "#372F29",
          800: "#2A231F",
          900: "#1D1815",
          950: "#120E0C",
        },
        cream: "#FBF7F0",
      },
      fontFamily: {
        serif: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(43,35,31,0.08), 0 2px 8px -2px rgba(43,35,31,0.05)",
        card: "0 2px 16px -2px rgba(43,35,31,0.07)",
        "card-hover": "0 24px 48px -12px rgba(43,35,31,0.22)",
        glass: "0 8px 32px rgba(43,35,31,0.14)",
        glow: "0 0 0 1px rgba(193,98,45,0.12), 0 8px 24px -4px rgba(193,98,45,0.25)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(20px, -25px) scale(1.08)" },
          "66%": { transform: "translate(-15px, 15px) scale(0.95)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        blob: "blob 12s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
