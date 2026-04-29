import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Papa from 'papaparse';
import { prisma } from '@/prisma';
import { parseArgs, requireStringArg, SPACE_ID } from '@/scripts/tickers/lib';

// CSV columns produced by the HTSUS per-chapter download at
// https://hts.usitc.gov/. Header order is fixed; some rows have a blank
// "HTS Number" — those are header rows that exist only to indent rows
// below them. Rows are presented in display order, which we preserve as
// `sortOrder` to reconstruct the indent hierarchy.
interface CsvRow {
  'HTS Number': string;
  Indent: string;
  Description: string;
  'Unit of Quantity': string;
  'General Rate of Duty': string;
  'Special Rate of Duty': string;
  'Column 2 Rate of Duty': string;
  'Quota Quantity': string;
  'Additional Duties': string;
}

function parseUnitOfQuantity(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  // Cell is itself a JSON-encoded array, e.g. `["No.","kg"]`.
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed) && parsed.every((v): v is string => typeof v === 'string')) {
      return parsed;
    }
  } catch {
    // Fall through to literal-string fallback.
  }
  return [trimmed];
}

function nullIfEmpty(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed.length === 0 ? null : trimmed;
}

// Returns the 10-digit form with separators removed, or null if the
// HTS number isn't a full 10-digit code.
function toHtsCode10(htsNumber: string | null): string | null {
  if (!htsNumber) return null;
  const digits = htsNumber.replace(/\./g, '');
  return digits.length === 10 ? digits : null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const csvPath = path.resolve(requireStringArg(args, 'csv'));
  const chapterNumberRaw = requireStringArg(args, 'chapter');
  const chapterNumber = parseInt(chapterNumberRaw, 10);
  if (!Number.isFinite(chapterNumber) || chapterNumber < 1 || chapterNumber > 99) {
    throw new Error(`--chapter must be an integer 1..99, got "${chapterNumberRaw}"`);
  }

  console.log(`📄 Reading CSV: ${csvPath}`);
  const csvText = await readFile(csvPath, 'utf-8');
  const parsed = Papa.parse<CsvRow>(csvText, { header: true, skipEmptyLines: true });
  if (parsed.errors.length > 0) {
    const first = parsed.errors[0];
    throw new Error(`CSV parse error at row ${first.row}: ${first.message}`);
  }
  const rows = parsed.data;
  console.log(`✅ Parsed ${rows.length} CSV rows`);

  // Chapter shells (number, title, section FK) are populated via the
  // sections POST route ahead of time. The CSV ingest only fills in HTS
  // rows and never creates the chapter itself.
  const chapter = await prisma.tariffChapter.findUnique({
    where: { spaceId_number: { spaceId: SPACE_ID, number: chapterNumber } },
  });
  if (!chapter) {
    throw new Error(
      `Chapter ${chapterNumber} not found. Seed the section/chapter index first via POST /api/tariff-calculator/sections, then re-run this script.`
    );
  }
  console.log(`📚 Chapter ${chapterNumber} found: ${chapter.title} (id=${chapter.id})`);

  // Wipe the chapter's existing rows so re-runs are idempotent. Cascade
  // takes care of children via the parent self-relation (SET NULL).
  const deleted = await prisma.htsCode.deleteMany({ where: { chapterId: chapter.id } });
  if (deleted.count > 0) console.log(`🧹 Cleared ${deleted.count} stale HTS rows for chapter ${chapterNumber}`);

  // indentStack[i] = id of the most recently inserted row whose indent === i.
  // A row's parent is indentStack[indent - 1].
  const indentStack: (string | null)[] = [];
  let inserted = 0;
  let sortOrder = 0;

  for (const row of rows) {
    const htsNumber = nullIfEmpty(row['HTS Number']);
    const indentRaw = row['Indent'];
    const indent = parseInt(indentRaw, 10);
    if (!Number.isFinite(indent) || indent < 0) {
      throw new Error(`Bad indent at sortOrder=${sortOrder}: "${indentRaw}"`);
    }
    const description = row['Description'].trim();
    const parentId = indent === 0 ? null : indentStack[indent - 1] ?? null;

    const created = await prisma.htsCode.create({
      data: {
        spaceId: SPACE_ID,
        chapterId: chapter.id,
        htsNumber,
        htsCode10: toHtsCode10(htsNumber),
        indent,
        description,
        unitOfQuantity: parseUnitOfQuantity(row['Unit of Quantity']),
        generalRateOfDuty: nullIfEmpty(row['General Rate of Duty']),
        specialRateOfDuty: nullIfEmpty(row['Special Rate of Duty']),
        column2RateOfDuty: nullIfEmpty(row['Column 2 Rate of Duty']),
        quotaQuantity: nullIfEmpty(row['Quota Quantity']),
        additionalDuties: nullIfEmpty(row['Additional Duties']),
        parentId,
        sortOrder,
      },
    });

    indentStack[indent] = created.id;
    // Anything deeper than this row is no longer a valid parent.
    indentStack.length = indent + 1;
    inserted++;
    sortOrder++;
  }

  console.log(`✅ Inserted ${inserted} HTS rows for chapter ${chapterNumber}`);
}

main()
  .catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
