/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B9D',
        secondary: '#C490E4',
        accent: '#7ED3B2',
        warning: '#FFD93D',
        background: '#FFF5F8',
        surface: '#FFFFFF',
        text: '#4A4A4A',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'bonk': 'bonk 0.3s ease-out',
        'float-up': 'floatUp 1s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        bonk: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.8)' },
          '100%': { transform: 'scale(1)' },
        },
        floatUp: {
          '0%': { opacity: 1, transform: 'translateY(0)' },
          '100%': { opacity: 0, transform: 'translateY(-50px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 157, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 157, 0.6)' },
        },
      },
      fontFamily: {
        'game': ['Nunito', 'Comic Sans MS', 'cursive', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
