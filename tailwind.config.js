/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        fira: ['"Fira Code"', 'monospace'],
      },
      colors: {
        primDark: "#000000",
        secDark: "#0f0f0f",
        primAccent: "#931621",
        lightAccent: "#c8c8c8",
        darkAccent: "#b3b3b3",
      },
      backgroundImage: {
        'radial-bg': 'radial-gradient(circle, #450a0a, #000000)',
      },
    },
  },
  plugins: [],
}