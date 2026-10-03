/**
 * Next.js instrumentation hook (stable since 15.0).
 *
 * `register()` runs once per server instance before it accepts requests; `onRequestError`
 * fires for every server error Next catches. Together they feed the Grafana Cloud log
 * shipper — see docs/insights-ui/grafana-cloud-logging.md.
 */

import type { Instrumentation } from 'next';

function isNodeServerRuntime(): boolean {
  // The Edge runtime has no `process` hooks and no Buffer, and `next build` must not stream
  // build-time output into the production log stream.
  return process.env.NEXT_RUNTIME === 'nodejs' && process.env.NEXT_PHASE !== 'phase-production-build';
}

export async function register(): Promise<void> {
  if (!isNodeServerRuntime()) {
    return;
  }
  // Imported lazily so the Edge bundle never pulls in the Node-only logger.
  const { installServerLogging } = await import('@/lib/logging/serverLogger');
  installServerLogging();
}

export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (!isNodeServerRuntime()) {
    return;
  }
  const { shipRequestError } = await import('@/lib/logging/serverLogger');
  shipRequestError(err, { path: request.path, method: request.method }, context);
};
