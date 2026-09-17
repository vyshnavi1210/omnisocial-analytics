/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        },
        social: {
          twitter: '#1DA1F2',
          facebook: '#1877F2',
          instagram: '#E1306C',
          linkedin: '#0A66C2',
          youtube: '#FF0000',
        }
      }
    },
  },
  plugins: [],
}
