import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Ensure @dodao/web-core is transpiled by Next.js
  transpilePackages: ['@dodao/web-core'],
  compiler: {
    // Enables the styled-components SWC transform so components from @dodao/web-core work correctly
    styledComponents: true,
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
  async redirects() {
    return [
      {
        source: '/industry-tariff-report/commodityChemicals/:path*',
        destination: '/industry-tariff-report/commodity-chemicals/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/fertilizersAndAgriculturalChemicals/:path*',
        destination: '/industry-tariff-report/fertilizers-and-agricultural-chemicals/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/industrialGases/:path*',
        destination: '/industry-tariff-report/industrial-gases/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/diversifiedChemicals/:path*',
        destination: '/industry-tariff-report/diversified-chemicals/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/metalGlassPlasticContainers/:path*',
        destination: '/industry-tariff-report/metal-glass-plastic-containers/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/paperPlasticPackagingProductsAndMaterials/:path*',
        destination: '/industry-tariff-report/paper-plastic-packaging-products-and-materials/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/paperProducts/:path*',
        destination: '/industry-tariff-report/paper-products/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/householdAppliances/:path*',
        destination: '/industry-tariff-report/household-appliances/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/distillersAndVintners/:path*',
        destination: '/industry-tariff-report/distillers-and-vintners/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/softDrinksAndNonAlcoholicBeverages/:path*',
        destination: '/industry-tariff-report/soft-drinks-and-non-alcoholic-beverages/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/commercialPrinting/:path*',
        destination: '/industry-tariff-report/commercial-printing/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/heavyElectricalEquipment/:path*',
        destination: '/industry-tariff-report/heavy-electrical-equipment/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/industrialMachineryAndSupplies/:path*',
        destination: '/industry-tariff-report/industrial-machinery-and-supplies/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/aerospaceAndDefense/:path*',
        destination: '/industry-tariff-report/aerospace-and-defense/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/constructionMachineryAndHeavyTransportationEquipment/:path*',
        destination: '/industry-tariff-report/construction-machinery-and-heavy-transportation-equipment/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/healthCareEquipment/:path*',
        destination: '/industry-tariff-report/health-care-equipment/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/housewaresAndSpecialties/:path*',
        destination: '/industry-tariff-report/housewares-and-specialties/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/tiresAndRubber/:path*',
        destination: '/industry-tariff-report/tires-and-rubber/:path*',
        permanent: true,
      },
      {
        source: '/industry-tariff-report/:industryId/executive-summary',
        destination: '/industry-tariff-report/:industryId',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
