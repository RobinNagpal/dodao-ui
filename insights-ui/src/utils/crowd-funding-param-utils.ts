// Format checks for crowd-funding route params. `projectId` and `reportType` are interpolated into
// S3 keys (`crowd-fund-analysis/<projectId>/<reportType>.md`) and API fetch URLs, and scanners send
// path traversal / XSS payloads through them. Reject anything that is not a plain slug before any
// S3 or fetch work, and log it as an `[input-rejected]` warning (not an error).
import { inputRejectedMessage, matchesInputPattern } from '@/utils/route-param-utils';
import { notFoundError } from '@dodao/web-core/api/errors/notFoundError';
import { notFound } from 'next/navigation';

/** Project ids are the S3 folder names under `crowd-fund-analysis/`: lowercase, `_` or `-` separated (e.g. `drop_water`, `health-care-originals`). */
export const CROWD_FUNDING_PROJECT_ID_PATTERN = /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/;

/**
 * Report types are snake_case keys of `agent-status.json` `reports` / `<type>.md` files (e.g. `founder_and_team`, `final`).
 * A pattern rather than the `ReportType` enum, because real reports (`final`, `green_flags`, ...) exist outside the enum
 * and the admin debug table links to them.
 */
export const CROWD_FUNDING_REPORT_TYPE_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

const SCOPE = 'crowd-funding';

export interface CrowdFundingParams {
  projectId?: string;
  reportType?: string;
}

/** The `[input-rejected]` message for the first invalid param, or null when every given param is valid. Pure. */
export function getCrowdFundingParamRejection({ projectId, reportType }: CrowdFundingParams): string | null {
  if (projectId !== undefined && !matchesInputPattern(projectId, CROWD_FUNDING_PROJECT_ID_PATTERN)) {
    return inputRejectedMessage(SCOPE, 'projectId', projectId);
  }
  if (reportType !== undefined && !matchesInputPattern(reportType, CROWD_FUNDING_REPORT_TYPE_PATTERN)) {
    return inputRejectedMessage(SCOPE, 'reportType', reportType);
  }
  return null;
}

/** API routes: throw a 404 (logged once as a warn by withErrorHandlingV2) for an invalid param. */
export function assertValidCrowdFundingApiParams(params: CrowdFundingParams): void {
  const rejection = getCrowdFundingParamRejection(params);
  if (rejection) throw notFoundError(rejection);
}

/** Pages / server components: warn and render the 404 page for an invalid param. */
export function assertValidCrowdFundingPageParams(params: CrowdFundingParams): void {
  const rejection = getCrowdFundingParamRejection(params);
  if (rejection) {
    console.warn(rejection);
    notFound();
  }
}
