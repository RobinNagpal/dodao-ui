import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

// Run `pnpm analyze` (or `ANALYZE=true pnpm build`) to emit chunk/treemap
// reports for the client + server bundles. No effect on regular builds.
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

const nextConfig: NextConfig = {
  // Emit a self-contained server build for the AWS/Lightsail container deploy. Inert on Vercel.
  output: 'standalone',
  // When set (AWS build), the browser loads /_next/static/* from this S3 base URL. Unset on
  // Vercel → normal same-origin asset serving. Build-time only (NEXT_PUBLIC_*).
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || undefined,
  compiler: {
    // Enables the styled-components SWC transform so components from @dodao/web-core work correctly
    styledComponents: true,
  },
  // Tree-shake re-export barrels (`@heroicons/react`, `@headlessui/react`,
  // `@react-icons/all-files`) down to only the icons/components actually used.
  // Next.js maintains a list of well-known optimized packages, but for these
  // big icon barrels we have to opt in explicitly.
  experimental: {
    optimizePackageImports: ['@heroicons/react', '@headlessui/react', '@react-icons/all-files'],
  },
  /* config options here */
  sassOptions: {
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

export default withBundleAnalyzer(nextConfig);
