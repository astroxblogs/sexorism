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
                 'light-bg-primary': '#ffffff',
                 'light-bg-secondary': '#f8fafc',
                 'dark-bg-primary': '#0f0f23',
                 'dark-bg-secondary': '#1a1a2e',
                 'text-dark': '#1f2937',
                 'text-light': '#f8fafc',
                 'text-muted': '#6b7280',
                 'accent': {
                     DEFAULT: '#7c3aed',
                     light: '#a855f7',
                     dark: '#5b21b6',
                 },
                 'border-light': '#e5e7eb',
                 'border-dark': '#374151',
             },

            fontFamily: {
                sans: ['ui-sans-serif', 'system-ui', 'Helvetica', 'Arial', 'sans-serif'],
            },

            typography: ({ theme }) => ({
                DEFAULT: {
                    css: {
                        fontFamily: theme('fontFamily.sans').join(', '),
                        'h1, h2, h3, h4, h5, h6': {
                            fontFamily: theme('fontFamily.sans').join(', '),
                            color: theme('colors.text-dark'),
                        },
                        '.dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6': {
                            color: theme('colors.text-light'),
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
