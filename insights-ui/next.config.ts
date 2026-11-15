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
  // Crawlers that get <title>, meta description and rel=canonical in <head> instead of streamed into
  // <body>. Next.js 15.5's default list (copied below; setting this replaces it) leaves out Googlebot,
  // so pages with slow generateMetadata (tariff chapters, stock industries) sent their canonical in
  // <body>, where Google ignores it: URL Inspection found no canonical on tariff /tariff-updates and
  // /understand-industry pages. Cost: Googlebot waits for generateMetadata before the first byte.
  htmlLimitedBots:
    /Googlebot|[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight/i,
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
    // This allows you to use variables defined `"app/styles/variables.scss` to be used in scss module files without
    // importing them explicitly
    includePaths: ['./src'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/RobinNagpal/dodao-ui/**',
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
