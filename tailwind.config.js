/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        }
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out forwards',
        'slideIn': 'slideIn 0.3s ease-out forwards',
      },
      colors: {
        // Original amber theme
        'quran-paper': '#FDF8EE',
        'quran-primary': '#92400E',
        'quran-secondary': '#B45309',
        'quran-accent': '#F59E0B',
        'quran-text': '#422006',
        'quran-border': '#D97706',
        // New book-like sepia theme
        'book-bg': '#F8F1E3',
        'book-paper': '#F5ECD9',
        'book-primary': '#5D4037',
        'book-secondary': '#8D6E63',
        'book-accent': '#A1887F',
        'book-text': '#3E2723',
        'book-border': '#8D6E63',
        'book-highlight': '#BCAAA4',
        'book': {
          'bg': '#f8f4e5',
          'text': '#5D4037',
          'heading': '#3E2723',
          'secondary': '#8D6E63',
          'tertiary': '#795548',
          'border': '#d3c6a6',
          'hover': '#e8e0ce',
          'active': '#e1d7c0',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        'arabic': ['var(--font-arabic)', 'var(--font-amiri)', 'serif'],
        'uthmani': ['"KFGQPC Uthmanic Script HAFS"', 'var(--font-arabic)', 'var(--font-amiri)', 'serif'],
      },
      boxShadow: {
        'islamic': '0 4px 14px 0 rgba(146, 64, 14, 0.1)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'slideDown': 'slideDown 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}