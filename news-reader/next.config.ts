import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Ensure @dodao/web-core is transpiled by Next.js
  compiler: {
    // Enables the styled-components SWC transform so components from @dodao/web-core work correctly
    styledComponents: true,
  },
  /* config options here */
  sassOptions: {
    implementation: 'sass-embedded',
    silenceDeprecations: ['legacy-js-api'],
    // This allows you to use variables defined `"app/styles/variables.scss` to be used in scss module files without
    // importing them explicitly
    includePaths: ['./src'],
  },
  images: {
    domains: ['raw.githubusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/RobinNagpal/dodao-ui/refs/heads/main/insights-ui/blogs',
      },
    ],
  },
};

export default nextConfig;
