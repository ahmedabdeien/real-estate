
const flowbite = require("flowbite-react/tailwind");
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0e8ad9',
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fb',
          400: '#38a9f8',
          500: '#0e8ad9',
          600: '#056db2',
          700: '#035690',
          800: '#064977',
          900: '#0c3e62',
          950: '#082741',
        },
        accent: {
          DEFAULT: '#f37200',
          50: '#fff6ed',
          100: '#ffead5',
          200: '#ffd1a9',
          300: '#ffae71',
          400: '#ff8137',
          500: '#f37200',
          600: '#db5900',
          700: '#b64100',
          800: '#903508',
          900: '#762d0a',
          950: '#411503',
        },
        wp: {
          blue: '#2271b1',
          dark: '#1d2327',
        }
      },
      fontFamily: {
        heading: ['Montserrat', 'Cairo', 'sans-serif'],
        body: ['Inter', 'Cairo', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'premium-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'premium-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.12)',
      }
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
    flowbite.plugin(),
    require('tailwind-scrollbar'),
  ],
}


