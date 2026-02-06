import createMDX from '@next/mdx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  transpilePackages: ['@dodao/web-core'],
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
    
    // Resolve next-auth from academy-ui's node_modules
    // This ensures that when transpiling @dodao/web-core, next-auth is found
    // Don't alias react/next - let Next.js handle those internally
    config.resolve.alias = {
      ...config.resolve.alias,
      'next-auth': path.resolve(__dirname, 'node_modules/next-auth'),
    };
    
    return config
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


export default nextConfig;
