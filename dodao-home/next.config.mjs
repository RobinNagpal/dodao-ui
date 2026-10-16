import createMDX from '@next/mdx';

/**
 * dodao.io is a purely static site: `next build` writes plain HTML/CSS/JS to `out/`, which CI
 * syncs to S3 behind CloudFront (see deployments/dodao-home). No server, no API routes, no DB.
 *
 * `trailingSlash: false` makes every route export as `<route>.html` (e.g.
 * `out/home-section/dodao-io/products/tidbitshub.html`), so the canonical URLs stay exactly what
 * they were on the old academy-ui deployment (no trailing slash). The CloudFront viewer-request
 * function maps the extension-less request path onto that `.html` object.
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',
  trailingSlash: false,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    // The Next image optimizer needs a server; serve the original files instead.
    unoptimized: true,
  },
  sassOptions: {
    includePaths: ['./src'],
    prependData: `@import "app/styles/variables.scss";`,
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
