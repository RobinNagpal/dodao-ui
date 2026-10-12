import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ACCEPTED_GAPS_FILE, chapterKey, formatJson, rateWaiverFor, type AcceptedGapsFile } from './lib/calc-readiness';
import { loadHtsSource, parseCliArgs, stringArg } from './lib/hts-source';
import { buildRateStrings, chapterRateGaps, describeRateGap, loadRateStrings, RATE_STRINGS_FILE } from './lib/rate-parse';

/**
 * Can the official-measures engine price every HTS base rate? Runs each distinct general / column 2 / special rate
 * string of every chapter through the shared rate parser (src/utils/tariff-reports/shipment-duty.ts) and lists, per
 * chapter, the strings it can't read or reads into a unit the calculator can't ask a quantity for. The same check gates
 * `pnpm tariff:calc-readiness` (a chapter with an unaccepted one is NOT READY); "rates" waivers in accepted-gaps.json
 * accept known ones.
 *
 *   pnpm tariff:rate-parse                                   # report from the committed rate-strings.json
 *   pnpm tariff:rate-parse --chapter 6 --chapter 17          # just these chapters
 *   pnpm tariff:rate-parse --hts-file ~/Downloads/hts_2026_revision_21_json.json   # rebuild rate-strings.json first
 *   pnpm tariff:rate-parse --edition "2026 Revision 22"      # rebuild from usitc.gov (no --hts-file)
 *
 * Exit code 1 when a listed --chapter has an unaccepted unpriceable rate.
 */

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const chapters: string[] = [];
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--chapter') {
      for (const c of (argv[++i] ?? '').split(',')) chapters.push(chapterKey(parseInt(c, 10)));
    } else rest.push(argv[i]);
  }
  const args = parseCliArgs(rest);
  const htsFile = stringArg(args, 'hts-file');
  const edition = stringArg(args, 'edition');
  if (htsFile || edition) {
    const hts = await loadHtsSource({ file: htsFile, edition });
    const { file, prefixFallbackLines, noRateLines } = buildRateStrings(hts.rows, hts.edition, hts.sourceUrl);
    writeFileSync(RATE_STRINGS_FILE, formatJson(file) + '\n');
    console.log(`Wrote ${path.relative(process.cwd(), RATE_STRINGS_FILE)} (${hts.edition}, ${Object.keys(file.chapters).length} chapters)`);
    if (prefixFallbackLines.length > 0) {
      console.log(
        `\n${prefixFallbackLines.length} line(s) skip an indent level, so their rate came from the 8-digit subheading by HTS number ` +
          `(check hts_codes.parent_id reaches it): ${prefixFallbackLines.join(' ')}`
      );
    }
    if (noRateLines.length > 0) console.log(`\n${noRateLines.length} line(s) with no general rate at all: ${noRateLines.join(' ')}`);
  }

  const file = loadRateStrings();
  const waivers = (existsSync(ACCEPTED_GAPS_FILE) ? (JSON.parse(readFileSync(ACCEPTED_GAPS_FILE, 'utf8')) as AcceptedGapsFile) : { acceptedGaps: [] })
    .acceptedGaps;
  const today = new Date().toISOString().slice(0, 10);
  const live = waivers.filter((w) => w.reviewBy >= today);

  console.log(`\nRate strings: ${file.htsEdition} (extracted ${file.generatedAt.slice(0, 10)})`);
  const wanted = chapters.length > 0 ? chapters : Object.keys(file.chapters).sort();
  let blocking = 0;
  let accepted = 0;
  const clean: string[] = [];
  let failed = false;
  for (const ch of wanted) {
    const gaps = chapterRateGaps(file.chapters[ch]).map((g) => ({ ...g, acceptedBy: rateWaiverFor(live, ch, g)?.id }));
    if (gaps.length === 0) {
      clean.push(ch);
      continue;
    }
    const open = gaps.filter((g) => !g.acceptedBy);
    blocking += open.length;
    accepted += gaps.length - open.length;
    if (open.length > 0 && chapters.includes(ch)) failed = true;
    console.log(`\nChapter ${ch}: ${open.length} unpriceable, ${gaps.length - open.length} accepted`);
    for (const g of gaps)
      console.log(
        `  ${g.acceptedBy ? 'ACCEPTED' : 'UNPRICED'}  ${describeRateGap({ ...g, acceptedBy: undefined })}${g.acceptedBy ? ` [${g.acceptedBy}]` : ''}`
      );
  }
  console.log(`\n${blocking} unpriceable rate string(s) block chapters; ${accepted} accepted by waivers. All rates priceable: ${clean.join(', ') || '—'}`);
  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
