import { setSectionStatus } from '@/scripts/industry-tariff-reports/tariff-report-repository';
import type { ChapterReportField } from '@/utils/tariff-reports/chapter-generate-sections';

/**
 * Master switch for HOW tariff sections are generated, read from the
 * `USE_LAMBDA_FOR_TARIFF_LLM_RESPONSE` env var:
 *   - `true`  → run the new BACKGROUND logic (`startTariffSectionGeneration`):
 *               kick the LLM call off as a fire-and-forget task, return right
 *               away, no CloudFront 504.
 *   - unset/`false` → run the OLD synchronous logic (the request awaits the LLM
 *               call and returns the full report).
 *
 * The flag name carries the `TARIFF` keyword so it's unambiguous this gates
 * tariff generation only.
 *
 * NOTE: deliberately NOT named `use…` — ESLint's `react-hooks/rules-of-hooks`
 * treats any `use`-prefixed function as a React hook and errors when it's
 * called outside a component/hook.
 */
export function isLambdaTariffGenerationEnabled(): boolean {
  return process.env.USE_LAMBDA_FOR_TARIFF_LLM_RESPONSE === 'true';
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Runs one tariff report section in the BACKGROUND and returns immediately.
 * Only called when `isLambdaTariffGenerationEnabled()` is true (the route
 * wrapper decides); the synchronous path lives in `chapterGenerateRoute`.
 *
 * Marks the section `InProgress`, then runs `generate` (the existing
 * `getAndWrite*` function — Gemini call + direct `prisma.tariffChapterReport.update`)
 * as a fire-and-forget task in this Next.js process. The HTTP route returns
 * right away, so a multi-minute Gemini call no longer holds the request open
 * past the CloudFront origin timeout (the cause of the 504 on
 * `understandIndustry`). No callback is needed: the background task already has
 * the Prisma client and saves directly. `section_status` records progress
 * (InProgress → Completed/Failed); the admin re-fetches via the table's Refresh
 * button to see when a section lands (we deliberately don't auto-poll).
 *
 * Caveat (intentional, documented): an in-process background task lives only in
 * this process's memory, so a redeploy/crash mid-run leaves the section stuck
 * on `InProgress`. This is acceptable on the long-lived Lightsail server; a
 * stuck-`InProgress` sweep can be layered on later.
 */
export async function startTariffSectionGeneration(slug: string, section: ChapterReportField, generate: () => Promise<void>): Promise<void> {
  // Stamp InProgress synchronously so the first status read sees it, then hand
  // off to the background and return to the route.
  await setSectionStatus(slug, section, 'InProgress');

  // Fire-and-forget. `.catch` on the IIFE is mandatory — an unhandled rejection
  // in a detached promise can take down the Node process.
  void (async (): Promise<void> => {
    try {
      await generate();
      await setSectionStatus(slug, section, 'Completed');
    } catch (err) {
      console.error(`Tariff section "${section}" generation failed for "${slug}":`, err);
      await setSectionStatus(slug, section, 'Failed', errorMessage(err)).catch((statusErr) => {
        console.error(`Failed to record Failed status for section "${section}" / "${slug}":`, statusErr);
      });
    }
  })();
}
