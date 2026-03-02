# Tariffs Functionality in Insights-UI

## Overview

The Insights-UI project includes a comprehensive tariff analysis system that generates detailed reports on how trade tariffs impact various industries. This system uses AI to analyze tariff changes, evaluate industry impacts, and produce actionable insights for businesses and investors.

## Core Architecture

### Industry Support
The system supports **40+ industries** including:
- **Manufacturing**: Plastics, Automobiles, Aluminium, Iron & Steel, Copper
- **Chemicals**: Commodity Chemicals, Specialty Chemicals, Fertilizers, Industrial Gases
- **Consumer Goods**: Apparel & Accessories, Consumer Electronics, Household Appliances
- **Food & Beverage**: Packaged Foods, Brewers, Distillers, Soft Drinks
- **Technology**: Semiconductors, Electrical Components, Heavy Electrical Equipment
- **Materials**: Forest Products, Construction Materials, Paper Products
- **And many more...**

Each industry is defined in `TariffIndustryDefinition` with:
- Industry name and ID
- Report configuration (headings count, players count)
- Companies to ignore in analysis
- Related industry connections

### Report Generation Workflow

The tariff report generation follows a **multi-step pipeline**:

1. **Industry Headings** (`00-industry-main-headings.ts`)
   - Generates main industry areas and sub-areas for analysis
   - Creates the structural foundation for the report

2. **Report Cover** (`01-industry-cover.ts`)
   - Creates executive summary and cover information
   - Includes key metrics and overview

3. **Executive Summary** (`02-executive-summary.ts`)
   - Synthesizes all analysis into executive-level insights
   - Highlights key findings and recommendations

4. **Tariff Updates** (`03-industry-tariffs.ts`)
   - Analyzes current tariff changes by country
   - Details specific tariff rates and trade impacts
   - Identifies exempted vs. impacted trade flows

5. **Industry Understanding** (`04-understand-industry.ts`)
   - Deep dive into industry structure and dynamics
   - Maps supply chains and key players

6. **Industry Areas Analysis** (`05-industry-areas.ts`)
   - Breaks down industry into specific sub-sectors
   - Analyzes each area's characteristics

7. **Impact Evaluation** (`06-evaluate-industry-area.ts`)
   - Evaluates tariff impacts on each industry area
   - Identifies positive and negative effects on different company types
   - Generates impact summaries and charts

8. **Final Conclusion** (`07-final-conclusion.ts`)
   - Synthesizes all findings into actionable conclusions
   - Provides investment and business recommendations

9. **SEO Optimization** (`08-report-seo-info.ts`)
   - Generates SEO metadata for report pages
   - Optimizes for search visibility

10. **All Countries Analysis** (`09-all-countries-tariffs.ts`)
    - Comprehensive analysis across all relevant countries
    - Global tariff impact assessment

## Key Data Structures

### Core Types
- **`CountrySpecificTariff`**: Tariff details for specific countries
- **`TariffUpdatesForIndustry`**: Complete tariff update information
- **`IndustryTariffReport`**: Full report structure
- **`EvaluateIndustryArea`**: Industry area impact analysis
- **`TariffReportSeoDetails`**: SEO metadata

### Company Analysis
- **`EstablishedPlayer`**: Analysis of established industry players
- **`NewChallenger`**: Analysis of emerging companies
- **`PositiveTariffImpactOnCompanyType`**: Companies benefiting from tariffs
- **`NegativeTariffImpactOnCompanyType`**: Companies hurt by tariffs

## UI Components

### Page Components
- **`TariffUpdatesPage`**: Displays tariff updates for an industry
- **`AllCountriesTariffUpdatesPage`**: Shows global tariff analysis
- **`TariffReportsPage`**: Lists all available tariff reports

### Renderers
- **`CountryTariffRenderer`**: Renders country-specific tariff information
- **`FinalConclusionRenderer`**: Displays final analysis and recommendations

### Action Components
- **`TariffUpdatesActions`**: Admin actions for tariff updates
- **`AllCountriesTariffUpdatesActions`**: Actions for global tariff data
- **`FinalConclusionActions`**: Actions for conclusion management

## API Endpoints

### Report Generation APIs
- **`/api/industry-tariff-reports/[industry]/generate-tariff-updates`**
  - Generates tariff updates for specific industry
  - Accepts country and tariff index parameters

- **`/api/industry-tariff-reports/[industry]/generate-evaluate-industry-area`**
  - Evaluates tariff impacts on industry areas
  - Supports different evaluation types (company impact, summary, etc.)

- **`/api/industry-tariff-reports/[industry]/generate-seo-info`**
  - Generates SEO metadata for reports
  - Optimizes for search engine visibility

- **`/api/industry-tariff-reports/[industry]/save-markdown`**
  - Saves generated reports in markdown format
  - Handles different report sections

## File Storage & Caching

### S3 Integration
- Reports stored in AWS S3 with structured paths
- JSON and markdown formats supported
- Automatic cache invalidation on updates

### Cache Management
- **`tariff-report-cache-utils.ts`**: Cache invalidation utilities
- **`tariff-report-tags.ts`**: Cache tagging system
- Revalidation triggers for updated reports

## Usage Examples

### Generating a Complete Report
```typescript
import { doIt } from '@/scripts/run-tariff-report';
import { ReportType, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-types';
import { getTariffIndustryDefinitionById } from '@/scripts/industry-tariff-reports/tariff-industries';

const industry = getTariffIndustryDefinitionById(TariffIndustryId.plastic);
await doIt(ReportType.ALL, industry);
```

### Generating Specific Sections
```typescript
// Generate only tariff updates
await doIt(ReportType.TARIFF_UPDATES, industry);

// Generate industry area evaluation
await doIt(ReportType.EVALUATE_INDUSTRY_AREA, industry, {
  headingIndex: 0,
  subHeadingIndex: 1
});
```

### Using UI Components
```tsx
import TariffUpdatesActions from '@/components/industry-tariff/section-actions/TariffUpdatesActions';

<TariffUpdatesActions 
  industryId="plastic" 
  tariffIndex={0} 
  countryName="China" 
/>
```

## Key Features

### AI-Powered Analysis
- Uses structured AI prompts to generate comprehensive analysis
- Validates output with Zod schemas
- Ensures consistent report quality

### Multi-Country Support
- Analyzes tariffs from multiple countries simultaneously
- Identifies country-specific impacts and opportunities
- Supports global trade flow analysis

### Company Impact Assessment
- Categorizes companies by tariff impact (positive/negative)
- Analyzes established players vs. new challengers
- Provides investment recommendations

### SEO Optimization
- Generates optimized meta descriptions and titles
- Creates search-friendly URLs and content
- Supports organic discovery of reports

### Admin Interface
- Private admin pages for report generation
- Real-time generation status and controls
- Markdown editing capabilities

## Development Guidelines

### Adding New Industries
1. Add industry ID to `TariffIndustryId` enum
2. Define industry configuration in `TariffIndustries` record
3. Set up related industry connections
4. Configure company exclusion lists if needed

### Extending Report Types
1. Add new type to `ReportType` enum
2. Implement generation logic in appropriate script file
3. Add case handling in `run-tariff-report.ts`
4. Create corresponding UI components if needed

### API Development
- Follow existing patterns for async parameter handling
- Use proper error handling with try-catch blocks
- Implement proper TypeScript typing
- Add cache invalidation for data updates

This tariff functionality represents a sophisticated business intelligence system that transforms complex trade policy data into actionable business insights through AI-powered analysis and comprehensive reporting.
