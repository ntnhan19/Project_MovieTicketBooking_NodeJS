export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#e71a0f",
        "primary-dark": "#c41208",
        "primary-light": "#ff3b30",
        "light-bg": "#ffffff",
        "light-bg-secondary": "#f5f5f7",
        "gray-bg": "#f0f2f5",
        "card-bg": "#ffffff",
        "border-light": "rgba(0, 0, 0, 0.1)",
        "text-primary": "#333333",
        "text-secondary": "#666666",
        "dark-bg": "#111827",
        "dark-bg-secondary": "#1f2a44",
        "dark-text-primary": "#ffffff",
        "dark-text-secondary": "#d1d5db",
      },
      backgroundImage: {
        "light-gradient": "linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%)",
        "banner-overlay": "linear-gradient(90deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 100%)",
        "button-gradient": "linear-gradient(90deg, #e71a0f, #ff3b30)",
        "button-gradient-hover": "linear-gradient(90deg, #c41208, #e71a0f)",
        "dark-gradient": "linear-gradient(45deg, #7f1d1d, #4b5563, #7f1d1d)",
      },
      boxShadow: {
        card: "0 4px 12px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 20px rgba(0, 0, 0, 0.12)",
        button: "0 4px 6px rgba(0, 0, 0, 0.1)",
        "button-hover": "0 6px 12px rgba(231, 26, 15, 0.3)",
        navbar: "0 2px 8px rgba(0, 0, 0, 0.08)",
        "dark-card": "0 4px 12px rgba(0, 0, 0, 0.3)",
        "dark-card-hover": "0 8px 20px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        fadeIn: "fadeIn 0.8s ease-in-out",
        slideIn: "slideIn 0.5s ease-out",
        popIn: "popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        modalSlideIn: "modalSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        popIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        modalSlideIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(-20px) scale(0.95)",
            filter: "blur(8px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
            filter: "blur(0px)",
          },
        },
      },
      fontFamily: {
        sans: [
          "'SF Pro Display'",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
        logo: ["'Montserrat'", "'SF Pro Display'", "sans-serif"],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
  darkMode: 'class', // Sử dụng class-based dark mode
}