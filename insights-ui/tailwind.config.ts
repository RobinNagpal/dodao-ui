import type { Config } from 'tailwindcss';
const { fontSize } = require('tailwindcss/defaultTheme');

export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../shared/web-core/src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: ['text-orange-500', 'bg-orange-500', 'text-yellow-500'],
  theme: {
    extend: {
      // Semantic color tokens backed by the CSS variables in
      // `src/util/theme-colors.ts`. Leaf UI components should prefer these
      // (e.g. `bg-block`, `text-body`) over ad-hoc `bg-gray-*` so theming /
      // dark-mode stays centralized. Additive: the default palette is unchanged.
      colors: {
        primary: 'var(--primary-color)',
        'primary-text': 'var(--primary-text-color)',
        background: 'var(--bg-color)',
        body: 'var(--text-color)',
        heading: 'var(--heading-color)',
        link: 'var(--link-color)',
        block: 'var(--block-bg)',
        'block-border': 'var(--border-color)',
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
  plugins: [require('@tailwindcss/forms'), require('tailwindcss-animate')],
} satisfies Config;
