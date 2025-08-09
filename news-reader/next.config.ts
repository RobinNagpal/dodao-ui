import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
