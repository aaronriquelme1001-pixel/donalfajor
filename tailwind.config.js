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
          brown: '#5D4037',
          pink: '#F3C6C6',
          blue: '#9BD1D6',
          yellow: '#FFF176',
          cream: '#FDFBF7',
          dark: '#4E342E',
        }
      },
      fontFamily: {
        heading: ['Fredoka', 'system-ui', 'sans-serif'],
        handwritten: ['Gaegu', 'Caveat', 'cursive'],
        body: ['Fredoka', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
