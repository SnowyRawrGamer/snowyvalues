/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#10111a',
        panel: '#191a26',
        panel2: '#1b1c29',
        border: '#2b2c3b',
        accent: '#9b87f5',
        accentLight: '#a894ff',
        win: '#75dbaa',
        loss: '#ff7777',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
