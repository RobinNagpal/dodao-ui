/** @type {import('next').NextConfig} */
const nextConfig = {
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
  sassOptions: {
    includePaths: ['./src'],
    prependData: `@import "app/styles/variables.scss";`,
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version X-api-key',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
