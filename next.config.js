/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
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
  },
};

module.exports = nextConfig;
