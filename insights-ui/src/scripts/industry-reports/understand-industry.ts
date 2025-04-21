import { getLlmResponse } from './llm-utils';
import { IndustryHeadings } from './industry-main-headings';
import fs from 'fs';
import path from 'path';
import { z, ZodObject } from 'zod';
import { addDirectoryIfNotPresent, reportsOutDir } from '../reportFileUtils';

const IndustrySectionSchema = z.object({
  title: z.string().describe('Title of the section which discusses specific part of the article.'),
  paragraphs: z
    .string()
    .array()
    .describe(
      'Paragraphs of 3-5 lines each which explain each of the sections in detail' +
        'Be very specific. ' +
        'Include hyperlinks/citations in the content where ever possible. ' +
        'Every definition, and number should have a hyperlink. '
    ),
});

const UnderstandIndustrySchema = z.object({
  title: z.string().describe('Title of the article which discusses understanding the industry.'),
  sections: z
    .array(IndustrySectionSchema)
    .describe(
      '8-12 sections of 3-5 paragraph each which explain each of the sections in detail' +
        'Be very specific. ' +
        'Include hyperlinks/citations in the content where ever possible. ' +
        'Every definition, and number should have a hyperlink. '
    ),
});

interface UnderstandIndustry {
  title: string;
  sections: {
    title: string;
    paragraphs: string[];
  }[];
}

function getUnderstandIndustryPrompt(industry: string, headings: IndustryHeadings) {
  const prompt = `

I want to understand the ${industry} industry in depth. Give me a very detailed article
with 
- 6-12 Headings and 2-3 small paragraphs under each heading
- Try to share as many facts as possible. Facts can include volume/amount or dollar value.
- Add hyperlinks in the content for most definitionss, and numbers.
- The full article should be at least 3000 words
- Below are some of the important headings and I want you to focus on the most relevant ones. 
- I am also adding more details about the industry and I want to make sure each of those main areas
are being discussed in the article 
- Dont use any Katex or Latex or italics formatting in the response.

# Important Headings Below 

### 1. Product Deep‑Dive  
> *(Your “inside‑out” view of what’s made and why it sells.)*  
- **Product Definition & Scope**  
  - What exactly is “the product”? (Core good/service, add‑ons, bundled offers)  
  - How do you classify / segment it? (By technology, by end‑use, premium vs. commodity)  
- **Features & Performance Metrics**  
  - Key specs, quality standards, certifications  
  - KPIs customers care about (e.g. speed, durability, efficiency)  
- **Use‑Cases & Customer Jobs**  
  - Primary “jobs to be done”  
  - Secondary or emergent use‑cases  
- **Product Portfolio & Lifecycle**  
  - Stages (R&D → launch → growth → maturity → decline)  
  - Cannibalization & sunsetting strategies  
- **Value Proposition & Differentiation**  
  - What problem(s) does it solve?  
  - How is it unique vs. competitors?  
- **Pricing & Packaging**  
  - Cost‑plus, value‑based, tiered, subscription, a la carte…  
  - Volume / channel discounts, bundling strategies  
- **R&D & Innovation Pipeline**  
  - How much do incumbents invest?  
  - Emerging variants, incremental vs. disruptive innovations  


### 2. Market Analysis  
> *(Your “outside‑in” view of who buys, why, and on what terms.)*  
- **Market Definition & Segmentation**  
  - Total addressable market (TAM), serviceable available market (SAM)  
  - By geography, end‑market verticals, customer size, demographics  
- **Market Size & Growth Rates**  
  - Historical growth  
  - Near‑term forecasts (1–5 years)  
- **Demand Drivers & Trends**  
  - Macro: economic cycles, regulation, social shifts  
  - Micro: technology adoption, consumer preferences  
- **Customer Personas & Buying Process**  
  - Decision‑makers vs. users vs. influencers  
  - Purchase criteria, decision timelines, procurement cycles  
- **Distribution & Go‑to‑Market**  
  - Direct vs. indirect channels (e‑commerce, distributors, OEM partnerships)  
  - Sales force models, marketing funnels, after‑sales support  
- **Competitive Dynamics**  
  - Number & size of competitors; market shares  
  - Price wars, margin pressures, service differentiators  
- **Pricing Dynamics & Elasticity**  
  - Typical price points, discounting norms  
  - Sensitivity to price changes  
- **Barriers to Entry & Exit**  
  - Capital intensity, intellectual property, regulatory hurdles  


### 3. Value Chain & Supply Chain  
- **Raw Materials & Inputs**  
  - Key feedstocks, commodity vs. specialty inputs  
- **Manufacturing / Production**  
  - Process flows, capital equipment, batch vs. continuous  
- **Logistics & Inventory**  
  - Lead times, geographic footprint, JIT vs. stockpiling  
- **Channel Partners & Alliances**  
  - Joint ventures, co‑development, licensing deals  


### 4. Competitive Landscape  
- **Key Players & Market Positioning**  
- **Business Models & Revenue Streams**  
- **SWOT Analysis** (strengths, weaknesses, opportunities, threats)  
- **Porter’s Five Forces** (rivalry, new entrants, substitutes, buyer/supplier power)  


### 5. Regulatory & Legal Environment  
- **Industry‑Specific Regulations** (safety, environmental, trade)  
- **Standards & Certifications** (ISO, UL, FDA, CE, etc.)  
- **Intellectual Property** (patents, trademarks, trade secrets)  
- **Policy Trends** (tariffs, subsidies, bans, extended producer responsibility)  

### 6. Financial & Economic Metrics  
- **Cost Structure & Unit Economics**  
- **Typical Margins** (gross, EBITDA, net)  
- **Capital Intensity & Working Capital Needs**  
- **Valuation Benchmarks** (EV/EBITDA, P/E, P/S)  


### 7. Technology & Innovation  
- **Current Tech Stack** (materials, software, hardware)  
- **Digitalization & Automation** (IoT, AI, robotics)  
- **R&D Trends** (open innovation, consortia, start‑up ecosystems)  
- **Disruptive Threats** (new entrants, substitute technologies)  


### 8. Sustainability & ESG  
- **Environmental Impact** (emissions, waste, water)  
- **Circular Economy Initiatives** (recycling, take‑back programs)  
- **Social & Governance Factors** (labor practices, board structure)  
- **Reporting & Ratings** (CDP, MSCI, Sustainalytics)  


### 9. Customer & Stakeholder Perspectives  
- **Voice‑of‑Customer** (NPS, satisfaction surveys, social media sentiment)  
- **Key Partners** (suppliers, distributors, regulators, NGOs)  


### 10. Risks & Challenges  
- **Market Risks** (demand shocks, competitive disruptions)  
- **Operational Risks** (supply interruptions, quality failures)  
- **Regulatory & Geo‑Political Risks**  
- **Technology Obsolescence**  


### 11. Future Outlook & Strategic Implications  
- **Emerging Themes** (demographic shifts, climate transition, digital convergence)  
- **Scenario Planning** (best case / worst case)  
- **Strategic Moves** (M&A, vertical integration, diversification)  

# Various Sectors/Areas I want you to cover

${JSON.stringify(headings, null, 2)}

`;

  return prompt;
}

export async function getUnderstandIndustry(industry: string, headings: IndustryHeadings) {
  return await getLlmResponse<UnderstandIndustry>(getUnderstandIndustryPrompt(industry, headings), UnderstandIndustrySchema);
}

export async function getAndWriteUnderstandIndustryJson(industry: string, headings: IndustryHeadings) {
  const understandIndustry = await getUnderstandIndustry(industry, headings);
  console.log('Understand Industry:', understandIndustry);
  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), 'understand-industry');
  const filePath = path.join(dirPath, 'understand-industry.json');
  addDirectoryIfNotPresent(dirPath);
  fs.writeFileSync(filePath, JSON.stringify(understandIndustry, null, 2), {
    encoding: 'utf-8',
  });
}

export async function readUnderstandIndustryJsonFromFile(industry: string) {
  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), 'understand-industry');
  const filePath = path.join(dirPath, 'understand-industry.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  // Read the file contents and convert to string
  const contents: string = fs.readFileSync(filePath, 'utf-8').toString();
  // Parse the JSON data
  const understandIndustry: UnderstandIndustry = JSON.parse(contents);
  return understandIndustry;
}

export function writeUnderstandIndustryToMarkdownFile(industry: string, understandIndustry: UnderstandIndustry) {
  const dirPath = path.join(reportsOutDir, industry.toLowerCase(), 'understand-industry');
  const filePath = path.join(dirPath, 'understand-industry.md');
  addDirectoryIfNotPresent(dirPath);

  const markdownContent =
    `# ${understandIndustry.title}\n\n` +
    `${understandIndustry.sections.map((section) => `## ${section.title}\n${section.paragraphs.join('\n\n')}`).join('\n\n')}\n`;
  addDirectoryIfNotPresent(dirPath);

  fs.writeFileSync(filePath, markdownContent, {
    encoding: 'utf-8',
  });
}
