/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#002855', // CalBank Dark Blue
          light: '#004080',
          dark: '#001a33',
        },
        secondary: {
          DEFAULT: '#FFD700', // Gold/Yellow
          light: '#FFE033',
          dark: '#CCAC00',
        },
        accent: '#E63946',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
