/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#122421",
        pine: "#0E4A44",
        "pine-light": "#16716A",
        "pine-50": "#EAF4F1",
        coral: "#F0654A",
        "coral-dark": "#D14E36",
        paper: "#FBFAF6",
        gold: "#D9A441",
        line: "#D8E4E1",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 20px 60px -20px rgba(14, 74, 68, 0.25)",
        soft: "0 8px 30px -12px rgba(18, 36, 33, 0.18)",
      },
      borderRadius: {
        xl2: "1.75rem",
      },
      keyframes: {
        pulseLine: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
      },
      animation: {
        pulseLine: "pulseLine 2.4s ease-out forwards",
        floatSlow: "floatSlow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
