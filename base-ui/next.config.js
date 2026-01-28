const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure @dodao/web-core is transpiled by Next.js
  transpilePackages: ['@dodao/web-core'],
  experimental: {
    esmExternals: 'loose',
  },
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
  images: {
    domains: ['api.multiavatar.com', 'tailwindui.com', 'd31h13bdjwgzxs.cloudfront.net'],
  },
  env: {
    V2_API_SERVER_URL: process.env.V2_API_SERVER_URL,
    DODAO_SUPERADMINS: process.env.DODAO_SUPERADMINS,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.devtool = 'source-map';
    }

    // Resolve next-auth from base-ui's node_modules so @dodao/web-core
    // reuses the same next-auth instance
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'next-auth': path.resolve(__dirname, 'node_modules/next-auth'),
    };

    return config;
  },
};

module.exports = nextConfig;
