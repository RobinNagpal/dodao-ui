/** @type {import('tailwindcss').Config} */
const { fontSize } = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}', '../shared/web-core/src/components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // Semantic color tokens for the dodao.io (DoDAO Home) pages, backed by
      // the CSS variables defined once in
      // `src/components/home/DoDAOHome/dodaoHomeThemeColors.ts` (the palette
      // shared with insights-ui). DoDAO Home components MUST use these tokens
      // (`bg-bg`, `bg-surface`, `text-heading`, `text-muted`, `border-border`,
      // `bg-primary/20`, …) instead of raw palette classes like `bg-gray-900`.
      // The `rgb(var(...) / <alpha-value>)` form keeps Tailwind opacity
      // modifiers (e.g. `bg-primary/15`) working.
      colors: {
        // Brand
        primary: 'rgb(var(--primary-rgb) / <alpha-value>)',
        'primary-text': 'rgb(var(--primary-text-rgb) / <alpha-value>)',
        link: 'rgb(var(--link-rgb) / <alpha-value>)',

        // Surfaces (3-tier ramp): bg (page) < surface (cards) < surface-2 (inset)
        bg: 'rgb(var(--bg-rgb) / <alpha-value>)',
        surface: 'rgb(var(--surface-rgb) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2-rgb) / <alpha-value>)',
        'surface-3': 'rgb(var(--surface-3-rgb) / <alpha-value>)',

        // Text — `text-heading` / `text-body` / `text-muted`
        heading: 'rgb(var(--heading-rgb) / <alpha-value>)',
        body: 'rgb(var(--text-rgb) / <alpha-value>)',
        muted: 'rgb(var(--text-muted-rgb) / <alpha-value>)',

        // Lines — `border-border`
        border: 'rgb(var(--border-rgb) / <alpha-value>)',

        // Status tones — chips/badges/indicators only
        success: 'rgb(var(--success-rgb) / <alpha-value>)',
        warning: 'rgb(var(--warning-rgb) / <alpha-value>)',
        danger: 'rgb(var(--danger-rgb) / <alpha-value>)',
        info: 'rgb(var(--info-rgb) / <alpha-value>)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: Object.fromEntries(
        Object.entries(fontSize).map(([key, value]) => {
          const [size, lineHeight] = Array.isArray(value) ? value : [value];
          // Inter font is a bit smaller than the default, so we increase the size a bit
          return [key, [parseFloat(size) * 1.1 + 'rem', lineHeight]];
        })
      ),
    },
    screens: {
      xs: '320px',

      s: '400px',

      sm: '640px',

      md: '768px',

      lg: '1024px',

      xl: '1280px',

      '2xl': '1536px',
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
