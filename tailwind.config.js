/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        },
        gold: {
          300: '#f3d9a7',
          400: '#eec98e',
          500: '#d4a574',
          600: '#b08a5e',
        }
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      animation: {
        blob: "blob 7s infinite",
        'blob-slow': "blob 10s infinite",
        'blob-fast': "blob 5s infinite",
        'pulse-slow': "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        'ping-slow': "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #f3d9a7 0%, #d4a574 50%, #b08a5e 100%)',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(243, 217, 167, 0.5)',
        'glow-gold-lg': '0 0 40px rgba(243, 217, 167, 0.7)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}