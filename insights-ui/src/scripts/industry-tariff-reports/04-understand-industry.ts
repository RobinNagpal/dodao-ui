import { writeJsonFileForUnderstandIndustry, writeMarkdownFileForUnderstandIndustry } from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { IndustryAreasWrapper, UnderstandIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
// import { getLlmResponse } from '@/scripts/llm-utils';
import { z } from 'zod';
import { getLlmResponse } from '../llm‑utils‑gemini';

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

function getUnderstandIndustryPrompt(industry: string, headings: IndustryAreasWrapper) {
  const prompt = `
I want to understand the ${industry} industry in depth. Give me a very detailed article with:
- Exactly **6 Headings** and **2–3 small paragraphs** under each heading
- Share as many facts as possible (volumes, amounts, dollar values)
- Add hyperlinks for definitions and key numbers throughout
- The full article should be at least **3000 words**
- Below are the consolidated key areas to cover under each of the six headings
- I am also adding more details about the industry to ensure each area is discussed

# Important Headings Below

### 1. Product & Innovation
> *(Inside‑out view of what's made, why it sells, and how it evolves)*
- **Definition & Scope**: core product, add‑ons, bundles, segmentation (technology, end‑use, premium vs. commodity)
- **Features & Performance**: key specs, quality standards, certifications, customer KPIs (speed, durability, efficiency)
- **R&D, Tech Stack & Pipeline**: incumbent R&D spend, emerging variants, digitalization (IoT, AI, robotics), disruptive innovations
- **Lifecycle & Differentiation**: R&D→launch→growth→maturity→decline, cannibalization strategies, unique value propositions

### 2. Market & Competition
> *(Outside‑in view of who buys, why, on what terms, and who else competes)*
- **Market Size & Segmentation**: TAM, SAM; by geography, vertical, customer size, demographics
- **Growth & Trends**: historical growth rates, 1–5 year forecasts, macro drivers (economic, regulatory, social), micro trends (tech adoption, consumer preferences)
- **Buyer Personas & Process**: decision‑makers vs. users vs. influencers, purchase criteria, timelines, procurement cycles
- **Competitive Dynamics**: number/size of players, market shares, business models, revenue streams, SWOT, Porter's Five Forces
- **Voice‑of‑Customer & Partners**: NPS, surveys, sentiment; suppliers, distributors, OEMs, NGOs

### 3. Supply Chain & Operations
> *(End‑to‑end value chain from inputs to delivery and risks)*
- **Raw Materials & Inputs**: key feedstocks, commodity vs. specialty inputs; price volatility
- **Manufacturing & Logistics**: process flows, capital equipment, batch vs. continuous, lead times, footprints, JIT vs. stockpiling
- **Alliances & Channels**: joint ventures, licensing, distribution partners, go‑to‑market models, after‑sales support
- **Operational Risks**: supply interruptions, quality failures, inventory constraints

### 4. Financial & Economic Metrics
> *(Quantitative health and performance benchmarks)*
- **Cost Structure & Unit Economics**: fixed vs. variable costs, scale effects
- **Margin Analysis**: gross, EBITDA, net
- **Capital & Working Capital**: capital intensity, capex, cash conversion cycle
- **Valuation & Pricing Dynamics**: EV/EBITDA, P/E, P/S benchmarks, price points, elasticity, discounting norms
- **Market Risks**: demand shocks, margin pressure, currency/regulatory impacts

### 5. Regulation & Legal
> *(Rules, responsibilities, and sustainability requirements)*
- **Regulatory Framework**: industry‑specific rules (safety, environmental, trade), policy trends (tariffs, subsidies, bans)
- **Standards & Certifications**: ISO, UL, FDA, CE, extended producer responsibility
- **Intellectual Property**: patents, trademarks, trade secrets, IP disputes
- **ESG & Sustainability**: emissions, waste, water usage, circular economy (recycling, take‑back), social governance (labor, board), reporting & ratings (CDP, MSCI)
- **Geo‑Political & Legal Risks**: trade wars, sanctions, compliance

### 6. Future Outlook & Strategy
> *(Forward‑looking themes, scenarios, and strategic imperatives)*
- **Emerging Themes**: demographic shifts, digital convergence, climate transition
- **Scenario Planning**: best‑case vs. worst‑case outlooks, stress tests
- **Strategic Moves**: M&A, vertical integration, diversification, partnerships
- **Risk Management**: regulatory evolution, technological obsolescence, geopolitical exposure


#  For output content:
  - Cite the latest figures and embed hyperlinks to sources.
  - Include hyperlinks/citations in the content where ever possible in the markdown format.
  - Dont forget to include hyperlinks/citations in the content where ever possible.
  - Avoid LaTeX, italics, or KaTeX formatting, or   character for space
  - Use only headings and subheadings, bold, bullets, points, tables for formatting the content.
  - Use markdown format for output.
  - All amounts, dollar values, or figures should be wrapped in backticks.


# Various Sectors/Areas I want you to cover

${JSON.stringify(headings, null, 2)}

`;

  return prompt;
}

export async function getUnderstandIndustry(industry: string, headings: IndustryAreasWrapper) {
  console.log('Invoking LLM for understanding industry');
  return await getLlmResponse<UnderstandIndustry>(getUnderstandIndustryPrompt(industry, headings), UnderstandIndustrySchema);
}

export async function getAndWriteUnderstandIndustryJson(industry: string, headings: IndustryAreasWrapper) {
  const understandIndustry = await getUnderstandIndustry(industry, headings);
  console.log('Understand Industry:', understandIndustry);

  await writeJsonFileForUnderstandIndustry(industry, understandIndustry);
  await writeMarkdownFileForUnderstandIndustry(industry, understandIndustry);
}
