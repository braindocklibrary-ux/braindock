/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#2e0854',
          deep: '#18042b',
          dark: '#0f021c',
          electric: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'purple-glow': '0 10px 30px -5px rgba(139, 92, 246, 0.25)',
        'purple-card': '0 4px 20px -2px rgba(88, 28, 135, 0.08)',
      }
    },
  },
  plugins: [],
}
