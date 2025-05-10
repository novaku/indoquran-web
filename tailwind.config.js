/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'quran-paper': '#FDF8EE',
        'quran-primary': '#92400E',
        'quran-secondary': '#B45309',
        'quran-accent': '#F59E0B',
        'quran-text': '#422006',
        'quran-border': '#D97706',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        'arabic': ['Noto Naskh Arabic', 'serif'],
        'arabic-translation': ['var(--font-amiri)'],
      },
      boxShadow: {
        'islamic': '0 4px 14px 0 rgba(146, 64, 14, 0.1)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}