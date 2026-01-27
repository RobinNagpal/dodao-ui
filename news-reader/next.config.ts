import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Ensure @dodao/web-core is transpiled by Next.js
  transpilePackages: ['@dodao/web-core'],
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
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.devtool = 'source-map';
    }

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Resolve next-auth from this app's node_modules so @dodao/web-core
      // reuses the same next-auth instance as other apps
      'next-auth': path.resolve(process.cwd(), 'node_modules/next-auth'),
    };

    return config;
  },
};

export default nextConfig;
