import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: '#FF1E1E',
          off: '#FF1E1E',
        },
        'dark-green': {
          DEFAULT: '#1A2B1F',
          'tint-1': '#2D3E32',
          'tint-2': '#3F5045',
        },
        'green-off-white': {
          DEFAULT: '#E8F0E8',
          '2': '#D4E4D4',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        display: ['Bebas Neue', 'cursive'],
      },
    },
  },
  plugins: [],
} satisfies Config;