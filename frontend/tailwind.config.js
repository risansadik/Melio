/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        pantry: {
          50: '#FAF6EE',
          100: '#F1E9D8',
          200: '#E2D3B0',
          700: '#4A5240',
          800: '#2F3A2F',
          900: '#1F2A1C',
        },
        clay: {
          400: '#E0A458',
          500: '#D98E2B',
          600: '#B6711C',
        },
        ink: '#211F1A',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        card: '0.25rem',
      },
    },
  },
  plugins: [],
}

