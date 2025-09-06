import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../shared/web-core/src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Marketing gradient colors
    'from-pink-500',
    'to-rose-600',
    'from-blue-500',
    'to-cyan-600',
    'from-green-500',
    'to-emerald-600',
    'from-yellow-500',
    'to-orange-600',
    'from-purple-500',
    'to-indigo-600',
  ],
  theme: {
    extend: {
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
} satisfies Config;
