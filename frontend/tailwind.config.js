/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#0c0e14',
          900: '#11141d',
          850: '#141721',
          800: '#191d2a',
          750: '#222736',
          700: '#2d3447',
          600: '#414a63'
        }
      }
    },
  },
  plugins: [],
}
