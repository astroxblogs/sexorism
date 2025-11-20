/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // --- NEW SOFT YELLOW LIGHT THEME (like reference screenshot) ---
        // Page background: very soft butter yellow
        'light-bg-primary': '#fff9ce',
        // Card / content background: slightly deeper warm yellow
        'light-bg-secondary': '#f5e6a3',
        // Accent background (highlights, chips, etc.)
        'light-bg-accent': '#f1e19a',

        // --- NEW DARK THEME (black with white font) ---
        'dark-bg-primary': '#000000',   // pure black
        'dark-bg-secondary': '#111827', // near-black for panels
        'dark-bg-accent': '#1f2937',    // dark gray accent

        // Text colors for both modes
        'text-dark': '#3b2e1a',         // deep brown for light mode text
        'text-light': '#f9fafb',        // very light text for dark mode
        'text-muted': '#a58b54',        // muted warm brown/gold

        // Golden accent (links, buttons, etc.)
        accent: {
          DEFAULT: '#b8860b',  // dark goldenrod
          light: '#facc15',    // soft bright gold
          dark: '#f59e0b',     // amber/orange for dark mode
        },

        // Borders
        'border-light': '#e3d59f', // warm light border
        'border-dark': '#4b5563',  // gray border for dark mode
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Helvetica', 'Arial', 'sans-serif'],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            fontFamily: theme('fontFamily.sans').join(', '),
            color: theme('colors.text-dark'),
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: theme('fontFamily.sans').join(', '),
              color: theme('colors.text-dark'),
            },
            a: { color: theme('colors.accent.DEFAULT') },
            '.dark &': {
              color: theme('colors.text-light'),
              'h1, h2, h3, h4, h5, h6': { color: theme('colors.text-light') },
              a: { color: theme('colors.accent.dark') },
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-filters')
  ],
};
