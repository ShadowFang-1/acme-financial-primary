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
          DEFAULT: '#001a33', // Deep Navy
          light: '#002855',
          dark: '#000d1a',
        },
        secondary: {
          DEFAULT: '#10b981', // Emerald
          light: '#34d399',
          dark: '#059669',
        },
        accent: '#0284c7', // Sky Blue
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },

    },
  },
  plugins: [],
}
