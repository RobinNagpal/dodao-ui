import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
  images: {
    domains: ['api.multiavatar.com', 'tailwindui.com', 'd31h13bdjwgzxs.cloudfront.net'],
  },
  webpack: (config, {isServer}) => {
    if (isServer) {
      config.devtool = 'source-map'
    }
    return config
  },
  experimental: {
    serverMinification: false,
    serverSourceMaps: true,
    allowDevelopmentBuilds: true,

  },
  productionBrowserSourceMaps: true,
  serverSourceMaps: true,
  serverMinification: false,
  env: {
    V2_API_SERVER_URL: process.env.V2_API_SERVER_URL,
    DODAO_SUPERADMINS: process.env.DODAO_SUPERADMINS,
  },
  sassOptions: {
    // This allows you to use variables defined `"app/styles/variables.scss` to be used in scss module files without
    // importing them explicitly
    includePaths: ['./src'],
    prependData: `@import "app/styles/variables.scss";`,
  },
  crossOrigin: 'anonymous',
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
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withMDX(nextConfig);
