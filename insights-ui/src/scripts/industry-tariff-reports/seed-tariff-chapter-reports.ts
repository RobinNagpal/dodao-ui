// Seeds the tariff_chapter_reports table from S3.
//
// For each (canonical industry → primary HTS chapter) pair below, fetches the
// industry's existing JSON sections from S3 and emits an INSERT statement that:
//  - resolves chapter_id via subquery on tariff_chapters (number)
//  - sets `slug` to the chapter's URL slug ({number}-{slug})
//  - sets `old_urls` to the legacy `/industry-tariff-report/<industryId>` URLs
//    (cover, evaluate-industry-areas, all-countries-tariff-updates) for ALL
//    industries that route to this chapter — including aliases that share a
//    chapter (e.g. semiconductors and household-appliances both land on 85).
//  - sets the five JSON section columns from the canonical industry's S3 data.
//
// Output: prisma/seeds/tariff-chapter-reports.sql (apply with psql).
//
// Run with: yarn tsx src/scripts/industry-tariff-reports/seed-tariff-chapter-reports.ts
import 'dotenv/config';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import {
  readReportCoverFromFile,
  readTariffUpdatesFromFile,
  readUnderstandIndustryJsonFromFile,
  readIndustryHeadingsFromFile,
  readFinalConclusionFromFile,
} from '@/scripts/industry-tariff-reports/tariff-report-read-write';
import { chapterUrlSlug, HTS_CHAPTERS, TariffIndustryId } from '@/scripts/industry-tariff-reports/tariff-industries';

interface ChapterSeed {
  // HTS chapter the row represents.
  chapterNumber: number;
  // Industry whose S3 data populates the JSON columns.
  contentIndustry: TariffIndustryId;
  // All industries whose legacy URLs should map to this chapter row. Includes
  // the content industry itself plus any alias industries that share the
  // chapter via primaryChapterNumber.
  oldUrlIndustries: TariffIndustryId[];
}

// Most-broadly-relevant HTS chapter per industry. Ordered for readability.
// Aliases (industries that share a chapter with a canonical owner) merge into
// the canonical owner's row by adding their industry IDs to oldUrlIndustries.
const CHAPTER_SEEDS: ChapterSeed[] = [
  {
    chapterNumber: 10,
    contentIndustry: TariffIndustryId.agriculturalProductsAndServices,
    oldUrlIndustries: [TariffIndustryId.agriculturalProductsAndServices],
  },
  { chapterNumber: 16, contentIndustry: TariffIndustryId.packagedFoodsAndMeats, oldUrlIndustries: [TariffIndustryId.packagedFoodsAndMeats] },
  {
    chapterNumber: 22,
    contentIndustry: TariffIndustryId.distillersAndVintners,
    oldUrlIndustries: [TariffIndustryId.distillersAndVintners, TariffIndustryId.brewers, TariffIndustryId.softDrinksAndNonAlcoholicBeverages],
  },
  { chapterNumber: 24, contentIndustry: TariffIndustryId.tobacco, oldUrlIndustries: [TariffIndustryId.tobacco] },
  { chapterNumber: 25, contentIndustry: TariffIndustryId.constructionMaterials, oldUrlIndustries: [TariffIndustryId.constructionMaterials] },
  { chapterNumber: 26, contentIndustry: TariffIndustryId.diversifiedMetalsAndMining, oldUrlIndustries: [TariffIndustryId.diversifiedMetalsAndMining] },
  { chapterNumber: 27, contentIndustry: TariffIndustryId.oilAndGasRefiningAndMarketing, oldUrlIndustries: [TariffIndustryId.oilAndGasRefiningAndMarketing] },
  {
    chapterNumber: 28,
    contentIndustry: TariffIndustryId.commodityChemicals,
    oldUrlIndustries: [TariffIndustryId.commodityChemicals, TariffIndustryId.industrialGases],
  },
  { chapterNumber: 30, contentIndustry: TariffIndustryId.pharmaceuticals, oldUrlIndustries: [TariffIndustryId.pharmaceuticals] },
  {
    chapterNumber: 31,
    contentIndustry: TariffIndustryId.fertilizersAndAgriculturalChemicals,
    oldUrlIndustries: [TariffIndustryId.fertilizersAndAgriculturalChemicals],
  },
  { chapterNumber: 32, contentIndustry: TariffIndustryId.specialtyChemicals, oldUrlIndustries: [TariffIndustryId.specialtyChemicals] },
  { chapterNumber: 37, contentIndustry: TariffIndustryId.consumerElectronics, oldUrlIndustries: [TariffIndustryId.consumerElectronics] },
  { chapterNumber: 38, contentIndustry: TariffIndustryId.diversifiedChemicals, oldUrlIndustries: [TariffIndustryId.diversifiedChemicals] },
  { chapterNumber: 39, contentIndustry: TariffIndustryId.plastic, oldUrlIndustries: [TariffIndustryId.plastic] },
  { chapterNumber: 40, contentIndustry: TariffIndustryId.tiresAndRubber, oldUrlIndustries: [TariffIndustryId.tiresAndRubber] },
  { chapterNumber: 44, contentIndustry: TariffIndustryId.forestProducts, oldUrlIndustries: [TariffIndustryId.forestProducts] },
  {
    chapterNumber: 48,
    contentIndustry: TariffIndustryId.paperProducts,
    oldUrlIndustries: [TariffIndustryId.paperProducts, TariffIndustryId.paperPlasticPackagingProductsAndMaterials],
  },
  { chapterNumber: 49, contentIndustry: TariffIndustryId.commercialPrinting, oldUrlIndustries: [TariffIndustryId.commercialPrinting] },
  { chapterNumber: 52, contentIndustry: TariffIndustryId.textiles, oldUrlIndustries: [TariffIndustryId.textiles] },
  { chapterNumber: 62, contentIndustry: TariffIndustryId.apparelandaccessories, oldUrlIndustries: [TariffIndustryId.apparelandaccessories] },
  { chapterNumber: 64, contentIndustry: TariffIndustryId.footwear, oldUrlIndustries: [TariffIndustryId.footwear] },
  { chapterNumber: 70, contentIndustry: TariffIndustryId.metalGlassPlasticContainers, oldUrlIndustries: [TariffIndustryId.metalGlassPlasticContainers] },
  { chapterNumber: 72, contentIndustry: TariffIndustryId.ironandsteel, oldUrlIndustries: [TariffIndustryId.ironandsteel] },
  { chapterNumber: 74, contentIndustry: TariffIndustryId.copper, oldUrlIndustries: [TariffIndustryId.copper] },
  { chapterNumber: 76, contentIndustry: TariffIndustryId.aluminium, oldUrlIndustries: [TariffIndustryId.aluminium] },
  { chapterNumber: 82, contentIndustry: TariffIndustryId.housewaresAndSpecialties, oldUrlIndustries: [TariffIndustryId.housewaresAndSpecialties] },
  { chapterNumber: 84, contentIndustry: TariffIndustryId.industrialMachineryAndSupplies, oldUrlIndustries: [TariffIndustryId.industrialMachineryAndSupplies] },
  {
    chapterNumber: 85,
    contentIndustry: TariffIndustryId.electricalcomponentsandequipment,
    oldUrlIndustries: [
      TariffIndustryId.electricalcomponentsandequipment,
      TariffIndustryId.semiconductors,
      TariffIndustryId.householdAppliances,
      TariffIndustryId.heavyElectricalEquipment,
    ],
  },
  {
    chapterNumber: 86,
    contentIndustry: TariffIndustryId.constructionMachineryAndHeavyTransportationEquipment,
    oldUrlIndustries: [TariffIndustryId.constructionMachineryAndHeavyTransportationEquipment],
  },
  { chapterNumber: 87, contentIndustry: TariffIndustryId.automobiles, oldUrlIndustries: [TariffIndustryId.automobiles] },
  { chapterNumber: 88, contentIndustry: TariffIndustryId.aerospaceAndDefense, oldUrlIndustries: [TariffIndustryId.aerospaceAndDefense] },
  { chapterNumber: 90, contentIndustry: TariffIndustryId.healthCareEquipment, oldUrlIndustries: [TariffIndustryId.healthCareEquipment] },
  { chapterNumber: 94, contentIndustry: TariffIndustryId.homefurnishings, oldUrlIndustries: [TariffIndustryId.homefurnishings] },
  { chapterNumber: 95, contentIndustry: TariffIndustryId.leisureProducts, oldUrlIndustries: [TariffIndustryId.leisureProducts] },
];

function legacyUrlsForIndustry(industryId: TariffIndustryId): string[] {
  const base = `/industry-tariff-report/${industryId}`;
  return [base, `${base}/evaluate-industry-areas`, `${base}/all-countries-tariff-updates`];
}

// Postgres array literal: ARRAY['a','b'] — escape single quotes inside elements.
function toPgTextArray(values: string[]): string {
  if (values.length === 0) return 'ARRAY[]::TEXT[]';
  const escaped = values.map((v) => `'${v.replace(/'/g, "''")}'`);
  return `ARRAY[${escaped.join(', ')}]::TEXT[]`;
}

// JSON value cast to jsonb. Single quotes inside JSON are escaped per Postgres
// string literal rules (`'` -> `''`).
function toPgJsonb(value: unknown): string {
  const json = JSON.stringify(value ?? {});
  return `'${json.replace(/'/g, "''")}'::jsonb`;
}

async function main() {
  console.log(`Building seed SQL for ${CHAPTER_SEEDS.length} chapters...`);

  const lines: string[] = [
    '-- Generated by src/scripts/industry-tariff-reports/seed-tariff-chapter-reports.ts',
    '-- Apply with: psql "$DATABASE_URL" -f prisma/seeds/tariff-chapter-reports.sql',
    '',
    'BEGIN;',
    '',
  ];

  for (const seed of CHAPTER_SEEDS) {
    const chapter = HTS_CHAPTERS[seed.chapterNumber];
    if (!chapter) {
      throw new Error(`HTS chapter ${seed.chapterNumber} not found in HTS_CHAPTERS`);
    }

    console.log(`  • chapter ${seed.chapterNumber} ← ${seed.contentIndustry} (${seed.oldUrlIndustries.length} legacy industries)`);

    const [introduction, tariffUpdates, understandIndustry, industryAreas, conclusion] = await Promise.all([
      readReportCoverFromFile(seed.contentIndustry),
      readTariffUpdatesFromFile(seed.contentIndustry),
      readUnderstandIndustryJsonFromFile(seed.contentIndustry),
      readIndustryHeadingsFromFile(seed.contentIndustry),
      readFinalConclusionFromFile(seed.contentIndustry),
    ]);

    if (!introduction) console.warn(`    ! ${seed.contentIndustry}: missing report-cover.json`);
    if (!tariffUpdates) console.warn(`    ! ${seed.contentIndustry}: missing tariff-updates.json`);
    if (!understandIndustry) console.warn(`    ! ${seed.contentIndustry}: missing understand-industry.json`);
    if (!industryAreas) console.warn(`    ! ${seed.contentIndustry}: missing industry-headings.json`);
    if (!conclusion) console.warn(`    ! ${seed.contentIndustry}: missing final-conclusion.json`);

    const oldUrls = seed.oldUrlIndustries.flatMap(legacyUrlsForIndustry);

    const id = randomUUID();
    const slug = chapterUrlSlug(chapter);

    lines.push(
      `-- chapter ${seed.chapterNumber} (${chapter.shortName}) — content from ${seed.contentIndustry}`,
      `INSERT INTO tariff_chapter_reports (`,
      `  id, chapter_id, slug, old_urls, introduction, tariff_updates, understand_industry, industry_areas, conclusion, space_id, updated_at`,
      `)`,
      `SELECT`,
      `  '${id}',`,
      `  c.id,`,
      `  '${slug}',`,
      `  ${toPgTextArray(oldUrls)},`,
      `  ${toPgJsonb(introduction)},`,
      `  ${toPgJsonb(tariffUpdates)},`,
      `  ${toPgJsonb(understandIndustry)},`,
      `  ${toPgJsonb(industryAreas)},`,
      `  ${toPgJsonb(conclusion)},`,
      `  'koala_gains',`,
      `  NOW()`,
      `FROM tariff_chapters c`,
      `WHERE c.number = ${seed.chapterNumber} AND c.space_id = 'koala_gains'`,
      `ON CONFLICT (space_id, chapter_id) DO UPDATE SET`,
      `  slug = EXCLUDED.slug,`,
      `  old_urls = EXCLUDED.old_urls,`,
      `  introduction = EXCLUDED.introduction,`,
      `  tariff_updates = EXCLUDED.tariff_updates,`,
      `  understand_industry = EXCLUDED.understand_industry,`,
      `  industry_areas = EXCLUDED.industry_areas,`,
      `  conclusion = EXCLUDED.conclusion,`,
      `  updated_at = NOW();`,
      ''
    );
  }

  lines.push('COMMIT;', '');

  const here = path.dirname(fileURLToPath(import.meta.url));
  const outDir = path.resolve(here, '../../../prisma/seeds');
  const outPath = path.join(outDir, 'tariff-chapter-reports.sql');
  await mkdir(outDir, { recursive: true });
  await writeFile(outPath, lines.join('\n'), 'utf8');

  console.log(`\nWrote ${lines.length} lines → ${outPath}`);
  console.log(`Apply with: psql "$DATABASE_URL" -f prisma/seeds/tariff-chapter-reports.sql`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
