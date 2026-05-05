import flowbite from "flowbite-react/tailwind";
import tailwindScrollbar from 'tailwind-scrollbar';

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
          DEFAULT: '#8A6924',
          50: '#faf8f3',
          100: '#f2ece2',
          200: '#e3d4bc',
          300: '#d3ba91',
          400: '#c19c62',
          500: '#b18342',
          600: '#8A6924', // Company Gold
          700: '#75541e',
          800: '#63461c',
          900: '#553c1b',
          950: '#31200c',
        },
        secondary: {
          DEFAULT: '#12283C', // Company Navy
          50: '#f2f6fa',
          100: '#e1ecf4',
          200: '#cadced',
          300: '#a3c4df',
          400: '#76a5cd',
          500: '#5388b8',
          600: '#406b9b',
          700: '#34557d',
          800: '#2d4868',
          900: '#12283C', // Main secondary
          950: '#1a2a40',
        },
        accent: {
          DEFAULT: '#DFBA6B', // Yellow Gold
          light: '#CDB785', // Light Beige/Gold
        },
        muted: {
          DEFAULT: '#C9CCC8', // Light Grey
          dark: '#4C545E', // Slate Grey
        },
        wp: {
          blue: '#2271b1',
          dark: '#1d2327',
        }
      },
      fontFamily: {
        heading: ['Roboto', 'Cairo', 'sans-serif'],
        body: ['Roboto', 'Cairo', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 1px 2px 0 rgba(0, 0, 0, 0.1)', // Odoo card shadow
        'premium-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'premium-xl': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'odoo': '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
        'odoo-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.2rem', // Odoo standard
        'md': '0.25rem',
        'lg': '0.3rem',
        'xl': '0.5rem',
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
    tailwindScrollbar,
  ],
}
