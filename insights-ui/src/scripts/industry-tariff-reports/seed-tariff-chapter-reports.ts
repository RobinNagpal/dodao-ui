// Seeds the tariff_chapter_reports table from S3.
//
// One row per HTS chapter (1–99, skipping 77 "Reserved"). Two flavors:
//
//  1. Chapters mapped in CHAPTER_SEEDS (41 industries → 41 unique chapters):
//     full INSERT with slug, old_url, and the five JSON section columns
//     populated from the canonical industry's S3 data.
//
//  2. Every other chapter: slug-only INSERT — old_url and JSON columns are
//     left NULL so the row exists for routing/listing but carries no content.
//
// The ON CONFLICT clauses are scoped so re-running the slug-only INSERT
// never overwrites content that was previously seeded for a chapter.
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
  // Canonical industry whose S3 data populates the JSON columns AND whose
  // industryId is stored in old_url for legacy URL routing.
  industry: TariffIndustryId;
}

// 41 industry → chapter assignments. Each industry gets its own unique chapter
// so every legacy `/industry-tariff-report/<id>/...` URL has a row to resolve
// against. For industries that have no obvious primary chapter (brewers, etc.),
// the closest-related free chapter is used.
const CHAPTER_SEEDS: ChapterSeed[] = [
  { chapterNumber: 10, industry: TariffIndustryId.agriculturalProductsAndServices },
  { chapterNumber: 11, industry: TariffIndustryId.brewers },
  { chapterNumber: 16, industry: TariffIndustryId.packagedFoodsAndMeats },
  { chapterNumber: 20, industry: TariffIndustryId.softDrinksAndNonAlcoholicBeverages },
  { chapterNumber: 22, industry: TariffIndustryId.distillersAndVintners },
  { chapterNumber: 24, industry: TariffIndustryId.tobacco },
  { chapterNumber: 25, industry: TariffIndustryId.constructionMaterials },
  { chapterNumber: 26, industry: TariffIndustryId.diversifiedMetalsAndMining },
  { chapterNumber: 27, industry: TariffIndustryId.oilAndGasRefiningAndMarketing },
  { chapterNumber: 28, industry: TariffIndustryId.commodityChemicals },
  { chapterNumber: 29, industry: TariffIndustryId.industrialGases },
  { chapterNumber: 30, industry: TariffIndustryId.pharmaceuticals },
  { chapterNumber: 31, industry: TariffIndustryId.fertilizersAndAgriculturalChemicals },
  { chapterNumber: 32, industry: TariffIndustryId.specialtyChemicals },
  { chapterNumber: 37, industry: TariffIndustryId.consumerElectronics },
  { chapterNumber: 38, industry: TariffIndustryId.diversifiedChemicals },
  { chapterNumber: 39, industry: TariffIndustryId.plastic },
  { chapterNumber: 40, industry: TariffIndustryId.tiresAndRubber },
  { chapterNumber: 44, industry: TariffIndustryId.forestProducts },
  { chapterNumber: 47, industry: TariffIndustryId.paperPlasticPackagingProductsAndMaterials },
  { chapterNumber: 48, industry: TariffIndustryId.paperProducts },
  { chapterNumber: 49, industry: TariffIndustryId.commercialPrinting },
  { chapterNumber: 52, industry: TariffIndustryId.textiles },
  { chapterNumber: 62, industry: TariffIndustryId.apparelandaccessories },
  { chapterNumber: 64, industry: TariffIndustryId.footwear },
  { chapterNumber: 70, industry: TariffIndustryId.metalGlassPlasticContainers },
  { chapterNumber: 72, industry: TariffIndustryId.ironandsteel },
  { chapterNumber: 73, industry: TariffIndustryId.householdAppliances },
  { chapterNumber: 74, industry: TariffIndustryId.copper },
  { chapterNumber: 75, industry: TariffIndustryId.heavyElectricalEquipment },
  { chapterNumber: 76, industry: TariffIndustryId.aluminium },
  { chapterNumber: 81, industry: TariffIndustryId.semiconductors },
  { chapterNumber: 82, industry: TariffIndustryId.housewaresAndSpecialties },
  { chapterNumber: 84, industry: TariffIndustryId.industrialMachineryAndSupplies },
  { chapterNumber: 85, industry: TariffIndustryId.electricalcomponentsandequipment },
  { chapterNumber: 86, industry: TariffIndustryId.constructionMachineryAndHeavyTransportationEquipment },
  { chapterNumber: 87, industry: TariffIndustryId.automobiles },
  { chapterNumber: 88, industry: TariffIndustryId.aerospaceAndDefense },
  { chapterNumber: 90, industry: TariffIndustryId.healthCareEquipment },
  { chapterNumber: 94, industry: TariffIndustryId.homefurnishings },
  { chapterNumber: 95, industry: TariffIndustryId.leisureProducts },
];

// JSON value cast to jsonb. Single quotes inside JSON are escaped per Postgres
// string literal rules (`'` -> `''`).
function toPgJsonb(value: unknown): string {
  const json = JSON.stringify(value ?? {});
  return `'${json.replace(/'/g, "''")}'::jsonb`;
}

async function main() {
  const seedByChapter = new Map(CHAPTER_SEEDS.map((s) => [s.chapterNumber, s]));
  const allChapterNumbers = Object.keys(HTS_CHAPTERS)
    .map(Number)
    .filter((n) => n !== 77)
    .sort((a, b) => a - b);

  const withContent = allChapterNumbers.filter((n) => seedByChapter.has(n));
  const slugOnly = allChapterNumbers.filter((n) => !seedByChapter.has(n));

  console.log(`Building seed SQL for ${allChapterNumbers.length} chapters ` + `(${withContent.length} with content, ${slugOnly.length} slug-only)...`);

  const lines: string[] = [
    '-- Generated by src/scripts/industry-tariff-reports/seed-tariff-chapter-reports.ts',
    '-- Apply with: psql "$DATABASE_URL" -f prisma/seeds/tariff-chapter-reports.sql',
    '',
    'BEGIN;',
    '',
  ];

  for (const chapterNumber of allChapterNumbers) {
    const chapter = HTS_CHAPTERS[chapterNumber];
    if (!chapter) throw new Error(`HTS chapter ${chapterNumber} not found in HTS_CHAPTERS`);

    const id = randomUUID();
    const slug = chapterUrlSlug(chapter);
    const seed = seedByChapter.get(chapterNumber);

    if (seed) {
      console.log(`  • chapter ${chapterNumber} ← ${seed.industry}`);

      const [introduction, tariffUpdates, understandIndustry, industryAreas, conclusion] = await Promise.all([
        readReportCoverFromFile(seed.industry),
        readTariffUpdatesFromFile(seed.industry),
        readUnderstandIndustryJsonFromFile(seed.industry),
        readIndustryHeadingsFromFile(seed.industry),
        readFinalConclusionFromFile(seed.industry),
      ]);

      if (!introduction) console.warn(`    ! ${seed.industry}: missing report-cover.json`);
      if (!tariffUpdates) console.warn(`    ! ${seed.industry}: missing tariff-updates.json`);
      if (!understandIndustry) console.warn(`    ! ${seed.industry}: missing understand-industry.json`);
      if (!industryAreas) console.warn(`    ! ${seed.industry}: missing industry-headings.json`);
      if (!conclusion) console.warn(`    ! ${seed.industry}: missing final-conclusion.json`);

      lines.push(
        `-- chapter ${chapterNumber} (${chapter.shortName}) — content from ${seed.industry}`,
        `INSERT INTO tariff_chapter_reports (`,
        `  id, chapter_id, slug, old_url, introduction, tariff_updates, understand_industry, industry_areas, conclusion, space_id, updated_at`,
        `)`,
        `SELECT`,
        `  '${id}',`,
        `  c.id,`,
        `  '${slug}',`,
        `  '${seed.industry}',`,
        `  ${toPgJsonb(introduction)},`,
        `  ${toPgJsonb(tariffUpdates)},`,
        `  ${toPgJsonb(understandIndustry)},`,
        `  ${toPgJsonb(industryAreas)},`,
        `  ${toPgJsonb(conclusion)},`,
        `  'koala_gains',`,
        `  NOW()`,
        `FROM tariff_chapters c`,
        `WHERE c.number = ${chapterNumber} AND c.space_id = 'koala_gains'`,
        `ON CONFLICT (space_id, chapter_id) DO UPDATE SET`,
        `  slug = EXCLUDED.slug,`,
        `  old_url = EXCLUDED.old_url,`,
        `  introduction = EXCLUDED.introduction,`,
        `  tariff_updates = EXCLUDED.tariff_updates,`,
        `  understand_industry = EXCLUDED.understand_industry,`,
        `  industry_areas = EXCLUDED.industry_areas,`,
        `  conclusion = EXCLUDED.conclusion,`,
        `  updated_at = NOW();`,
        ''
      );
    } else {
      // Slug-only row. ON CONFLICT preserves any previously seeded content
      // (only slug + updated_at are touched).
      lines.push(
        `-- chapter ${chapterNumber} (${chapter.shortName}) — slug only, no content`,
        `INSERT INTO tariff_chapter_reports (id, chapter_id, slug, space_id, updated_at)`,
        `SELECT '${id}', c.id, '${slug}', 'koala_gains', NOW()`,
        `FROM tariff_chapters c`,
        `WHERE c.number = ${chapterNumber} AND c.space_id = 'koala_gains'`,
        `ON CONFLICT (space_id, chapter_id) DO UPDATE SET`,
        `  slug = EXCLUDED.slug,`,
        `  updated_at = NOW();`,
        ''
      );
    }
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
