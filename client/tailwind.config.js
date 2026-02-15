/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          white: '#ffffff',
          'pale-sky': '#c8e5fc',
          'sky-blue': '#90caf9',
          'cool-sky': '#64b5f6',
          'cool-sky-2': '#42a5f5',
          'dodger-blue': '#2196f3',
          'brilliant-azure': '#1e88e5',
          'twitter-blue': '#1976d2',
          'regal-navy': '#0d3b69',
          black: '#000000',
        },
        primary: {
          50: '#c8e5fc',
          100: '#90caf9',
          200: '#64b5f6',
          300: '#42a5f5',
          400: '#2196f3',
          500: '#1e88e5',
          600: '#1976d2',
          700: '#0d3b69',
          800: '#0a2d4f',
          900: '#071f36',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, #2196f3, #1976d2, #0d3b69)',
      },
    },
  },
  plugins: [],
}

