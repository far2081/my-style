/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          DEFAULT: '#321B2F',
          dark: '#241322',
          deep: '#1E0E1B',
          light: '#42243E',
        },
        burgundy: {
          DEFAULT: '#4A2438',
          deep: '#361828',
          light: '#5E2E47',
        },
        mauve: {
          DEFAULT: '#76516A',
          deep: '#5C3E52',
          light: '#8E6480',
        },
        champagne: {
          DEFAULT: '#C9A86A',
          light: '#DFCA9B',
          dark: '#A88543',
          glow: '#F3E5C8',
        },
        ivory: {
          DEFAULT: '#F7F1EA',
          light: '#FDFAF7',
          warm: '#EFE7DC',
          dark: '#E2D5C3',
        },
        blush: {
          DEFAULT: '#E9D5D8',
          soft: '#F4EAEB',
          light: '#FAEFF1',
        },
        rose: {
          DEFAULT: '#B77A88',
          soft: '#CD929F',
          dark: '#9B5F6C',
        },
        charcoal: {
          DEFAULT: '#252127',
          dark: '#1A171B',
          light: '#353038',
        },
      },
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'serif'],
        cinzel: ['Cinzel', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 50px rgba(50, 27, 47, 0.25)',
        'gold-glow': '0 0 25px rgba(201, 168, 106, 0.35)',
        'gold-subtle': '0 4px 20px rgba(201, 168, 106, 0.15)',
        'inner-luxury': 'inset 0 2px 10px rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.92', transform: 'scale(1.02)' },
        },
      },
    },
  },
  plugins: [],
}
