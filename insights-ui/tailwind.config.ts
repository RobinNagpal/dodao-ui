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
      // `src/util/theme-colors.ts`. Components MUST prefer these
      // (e.g. `bg-surface`, `text-muted`, `border-border`) over ad-hoc
      // `bg-gray-*` so the palette stays tiny and theming is centralized.
      // Outside chips/badges/buttons, only these structural tokens should appear.
      colors: {
        // Brand
        primary: 'var(--primary-color)',
        'primary-text': 'var(--primary-text-color)',
        'primary-foreground': 'var(--primary-text-color)',
        link: 'var(--link-color)',
        // Secondary (blue) link — coexists with the violet `link`.
        'link-blue': 'var(--link-blue-color)',
        'link-blue-hover': 'var(--link-blue-hover-color)',

        // Surfaces (3-tier ramp): bg (page) < surface (cards) < surface-2 (inset)
        well: 'var(--well-bg)', // sunken input/well, one step below bg (gray-950)
        bg: 'var(--bg-color)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',

        // Text — `text-heading` / `text-body` / `text-muted`
        heading: 'var(--heading-color)',
        body: 'var(--text-color)',
        muted: 'var(--text-muted)',
        // Exact-gray muted ramp (see theme-colors.ts) — usable as `text-*`,
        // and `border-*`/`divide-*` where a matching hairline is needed.
        'muted-1': 'var(--text-muted-1)', // gray-300
        'muted-2': 'var(--text-muted-2)', // gray-400
        'muted-3': 'var(--text-muted-3)', // gray-500
        'muted-4': 'var(--text-muted-4)', // gray-600

        // Lines — `border-border`
        border: 'var(--border-color)',
        hairline: 'var(--hairline)', // gray-200 light hairline (`border-hairline`)

        // Legacy aliases (kept so existing `bg-block`/`bg-background` usages
        // keep resolving while call-sites migrate to the canonical names).
        background: 'var(--bg-color)',
        block: 'var(--surface)',
        'block-border': 'var(--border-color)',

        // Bridge previously-orphaned shadcn token names to the same vars so
        // `text-muted-foreground`, `bg-card`, etc. resolve consistently instead
        // of rendering nothing.
        card: 'var(--surface)',
        'card-foreground': 'var(--text-color)',
        foreground: 'var(--text-color)',
        'muted-foreground': 'var(--text-muted)',
        input: 'var(--border-color)',
        ring: 'var(--primary-color)',
        destructive: '#ef4444',
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
