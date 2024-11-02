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
        primLight: "#f8f8f8",
        primDark: "#110F18",
        primAccent: "#7255B1",
        secAccent: "#15141B"
      },
    },
  },
  plugins: [],
}