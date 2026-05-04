/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#003366",
        "primary-light": "#007BFF",
        "surface-light": "#F8F9FA",
        "text-main": "#333333",
        "on-surface-variant": "#666666",
      },
      borderRadius: {
        "cta": "12px",
      },
      fontFamily: {
        "headline": ["Plus Jakarta Sans", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "cta": ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
}
