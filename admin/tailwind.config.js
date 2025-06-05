/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  important: true,
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#e71a0f",
          dark: "#c41208",
          light: "#ff3b30",
        },
        secondary: {
          DEFAULT: "#1e293b",
          dark: "#0f172a",
          light: "#334155",
        },
        background: {
          light: "#f4f5f7",
          dark: "#121212",
          paper: "#ffffff",
          "paper-dark": "#1e1e1e"
        },
        text: {
          primary: "#333333",
          secondary: "#666666",
          "primary-dark": "#ffffff",
          "secondary-dark": "#aaaaaa",
        },
        border: {
          light: "#f0f0f0",
          DEFAULT: "#e0e0e0",
          dark: "#333333",
        },
        status: {
          active: "#34c759",
          "coming-soon": "#ff9500",
          inactive: "#ff3b30",
        }
      },
      fontFamily: {
        sans: ["'SF Pro Display'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "'Helvetica Neue'", "Arial", "sans-serif"],
        logo: ["'SF Pro Display'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "'Helvetica Neue'", "Arial", "sans-serif"],
      },
      boxShadow: {
        navbar: "0 2px 4px rgba(0,0,0,0.1)",
        card: "0 4px 12px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 20px rgba(0, 0, 0, 0.12)",
        sidebar: "2px 0 8px rgba(0, 0, 0, 0.15)",
        dropdown: "0 4px 20px rgba(0,0,0,0.15)",
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-in-out",
        slideIn: "slideIn 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
      transitionProperty: {
        height: "height",
        spacing: "margin, padding",
      },
    },
  },
  plugins: [],
}