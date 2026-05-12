import tailwindScrollbar from 'tailwind-scrollbar';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== ألوان الصرح للعقارات =====
        primary: {
          DEFAULT: '#8A6924',
          50:  '#fdf9ee',
          100: '#f9f0d0',
          200: '#f2e0a1',
          300: '#e8c96a',
          400: '#dfba6b',
          500: '#c4983a',
          600: '#8A6924',   // اللون الرئيسي (ذهبي)
          700: '#6b5219',
          800: '#4d3c12',
          900: '#12283C',   // كحلي - للخلفيات الداكنة
          950: '#0a1a26',
        },
        accent: {
          DEFAULT: '#DFBA6B',
          50:  '#fdf9ee',
          100: '#f9f0d0',
          200: '#f2e0a1',
          300: '#DFBA6B',   // ذهبي فاتح
          400: '#d4aa55',
          500: '#DFBA6B',
          600: '#c4983a',
          700: '#a87828',
          800: '#845e1e',
          900: '#614415',
        },
        secondary: {
          DEFAULT: '#12283C',
          50:  '#e8edf2',
          100: '#c5d3de',
          200: '#9eb4c5',
          300: '#7695ac',
          400: '#4f7799',
          500: '#2d5a7c',
          600: '#1a3f5c',
          700: '#12283C',   // كحلي داكن
          800: '#0d1e2e',
          900: '#080f18',
        },
        gold: {
          light: '#DFBA6B',
          DEFAULT: '#8A6924',
          dark: '#6b5219',
        },
        navy: {
          light: '#1e3a5c',
          DEFAULT: '#12283C',
          dark: '#080f18',
        },
      },
      fontFamily: {
        heading: ['Cairo', 'Montserrat', 'sans-serif'],
        body:    ['Cairo', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium':      '0 4px 24px -4px rgba(138, 105, 36, 0.15)',
        'premium-lg':   '0 10px 40px -8px rgba(138, 105, 36, 0.2)',
        'premium-xl':   '0 20px 60px -12px rgba(138, 105, 36, 0.25)',
        'gold':         '0 8px 32px -4px rgba(138, 105, 36, 0.35)',
        'glass':        '0 8px 32px 0 rgba(18, 40, 60, 0.12)',
        'glass-gold':   '0 8px 32px 0 rgba(138, 105, 36, 0.2)',
        'navy':         '0 8px 32px 0 rgba(18, 40, 60, 0.3)',
        'inner-gold':   'inset 0 1px 0 rgba(223, 186, 107, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      backgroundImage: {
        'gold-gradient':  'linear-gradient(135deg, #8A6924 0%, #DFBA6B 50%, #8A6924 100%)',
        'navy-gradient':  'linear-gradient(135deg, #0a1a26 0%, #12283C 50%, #1e3a5c 100%)',
        'hero-gradient':  'linear-gradient(to left, rgba(18,40,60,0.92) 0%, rgba(18,40,60,0.4) 60%, transparent 100%)',
        'card-shine':     'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)',
      },
      animation: {
        'float':    'float 6s ease-in-out infinite',
        'shimmer':  'shimmer 2s linear infinite',
        'glow':     'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(138,105,36,0.3)' },
          to:   { boxShadow: '0 0 40px rgba(138,105,36,0.6)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
  },
  plugins: [
    tailwindScrollbar,
  ],
}
