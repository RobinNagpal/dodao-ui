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
    // This allows you to use variables defined `"app/styles/variables.scss` to be used in scss module files without
    // importing them explicitly
    includePaths: ['./src'],
    prependData: `@import "app/styles/variables.scss";`,
  },
};

module.exports = nextConfig;
