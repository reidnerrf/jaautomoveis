/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Footer social hover colors
    "hover:text-blue-500",
    "hover:text-pink-500",
    "hover:text-green-500",
    // LoadingSpinner dynamic sizes
    "h-8",
    "w-8",
    "h-16",
    "w-16",
    "h-24",
    "w-24",
    // State-based classes toggled via JS
    "rotate-180",
    "border-main-red",
    "border-transparent",
    // Generic gradients used dynamically in HomePage services
    "from-blue-500",
    "to-blue-600",
    "from-green-500",
    "to-green-600",
    "from-purple-500",
    "to-purple-600",
    "from-orange-500",
    "to-orange-600",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#3C50E0",
        secondary: "#80CAEE",
        "main-red": "#D2282F",
        "secondary-blue": "#62A9F8",
        "comp-light-gray": "#F0E9E8",
        "comp-dark-blue": "#2427C3",
        "comp-muted-pink": "#AC8590",
        "comp-salmon": "#D26762",
        "box-dark": "#24303F",
        "main-dark": "#1A222C",
        stroke: "#E2E8F0",
        "body-color": "#637381",
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "bounce-light": "bounce 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
