import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: ['@dodao/web-core'],
  compiler: {
    // Enables the styled-components SWC transform so components from @dodao/web-core work correctly
    styledComponents: true,
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
    // This allows you to use variables defined `"app/styles/variables.scss` to be used in scss module files without
    // importing them explicitly
    includePaths: ['./src'],
  },
  crossOrigin: 'anonymous',
  productionBrowserSourceMaps: true,
  async headers() {
    console.log('Setting up headers');
    return [
      {
        // matching all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-api-key, dodao-auth-token',
          },
        ],
      },
    ];
  },
  webpack: (config, {isServer}) => {
    if (isServer) {
      config.devtool = 'source-map'
    }

    // Resolve next-auth and @headlessui/react from defi-alerts's node_modules
    // This ensures that when transpiling @dodao/web-core, these dependencies are found
    // Don't alias react/next - let Next.js handle those internally
    config.resolve.alias = {
      ...config.resolve.alias,
      'next-auth': path.resolve(__dirname, 'node_modules/next-auth'),
      '@headlessui/react': path.resolve(__dirname, 'node_modules/@headlessui/react'),
    };

    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/trustwallet/assets/master/blockchains/**',
      },
    ],
  },
};

export default nextConfig;
