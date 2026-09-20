/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          DEFAULT: "#2563eb",
        },
        surface: {
          page: "#f8fafc",
          card: "#ffffff",
          muted: "#f1f5f9",
        },
        status: {
          success: {
            DEFAULT: "#059669",
            muted: "#ecfdf5",
            text: "#047857",
            border: "#a7f3d0",
          },
          waiting: {
            DEFAULT: "#d97706",
            muted: "#fffbeb",
            text: "#b45309",
            border: "#fde68a",
          },
          danger: {
            DEFAULT: "#dc2626",
            muted: "#fef2f2",
            text: "#b91c1c",
            border: "#fecaca",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.05), 0 1px 3px 0 rgb(15 23 42 / 0.08)",
        modal: "0 20px 40px -12px rgb(15 23 42 / 0.18)",
      },
    },
  },
  plugins: [],
};
