/** @type {import('next').NextConfig} */


const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  // Ensure @dodao/web-core is transpiled by Next.js
  transpilePackages: ['@dodao/web-core'],
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
  sassOptions: {
    // This allows you to use variables defined `"app/styles/variables.scss` to be used in scss module files without
    // importing them explicitly
    includePaths: ['./src'],
    prependData: `@import "app/styles/variables.scss";`,
  },
};

export default nextConfig;
