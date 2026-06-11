/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          light: 'var(--color-primary-light)',
        },
        accent: 'var(--color-accent)',
        surface: 'var(--color-surface)',
        'text-dark': 'var(--color-text-dark)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
      },
      fontFamily: { sans: ['var(--font-family)', 'Tajawal', 'sans-serif'] },
      borderRadius: {
        btn: 'var(--btn-radius)',
        card: 'var(--card-radius)',
      },
    },
  },
  plugins: [],
};
