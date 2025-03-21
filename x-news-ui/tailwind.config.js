/** @type {import('tailwindcss').Config} */
const { fontSize } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../shared/web-core/src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
}

