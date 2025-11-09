/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f8ff',
          100: '#e3eefc',
          200: '#bfd9f8',
          300: '#93c0f0',
          400: '#559de6',
          500: '#2678d2',
          600: '#1a5dae',
          700: '#144a8b',
          800: '#123f72',
          900: '#102f54',
        },
      },
      boxShadow: {
        card: '0 24px 48px -24px rgba(16, 47, 84, 0.2)',
      },
      fontFamily: {
        display: ['"Inter Tight"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

