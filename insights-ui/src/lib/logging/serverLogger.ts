/**
 * Wires the app's existing logging into the Loki shipper (lokiClient.ts).
 *
 * The app already has ~218 `console.error` call sites (every withErrorHandling* wrapper in
 * shared/web-core funnels through them), so rather than refactoring them all this patches
 * `console.error` / `console.warn` once at server startup. The original console is always
 * called first, so stdout — and therefore `aws lightsail get-container-log` — keeps working
 * exactly as before and stays the fallback if shipping is down.
 *
 * Installed from src/instrumentation.ts. See docs/insights-ui/grafana-cloud-logging.md.
 */

import { flushLoki, initLoki, setShipperErrorReporter, shipToLoki } from './lokiClient';

let installed = false;

/** Formats console arguments the way Node's console would, but as a single string. */
function formatArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === 'string') {
        return arg;
      }
      if (arg instanceof Error) {
        return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ''}`;
      }
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(' ');
}

/** The first Error among the console arguments, so its stack can be shipped as its own field. */
function firstErrorStack(args: unknown[]): string | undefined {
  const error = args.find((arg): arg is Error => arg instanceof Error);
  return error?.stack;
}

/**
 * Patch console + install process hooks. Idempotent, and a no-op when Loki is not configured
 * (so local dev and Vercel behave exactly as they do today).
 */
export async function installServerLogging(): Promise<void> {
  if (installed) {
    return;
  }
  installed = true;
  if (!(await initLoki())) {
    return;
  }

  const originalError = console.error.bind(console);
  const originalWarn = console.warn.bind(console);

  // Give the shipper the pristine console.error BEFORE patching, so a failed push reports to
  // stdout instead of being queued as a fresh error line.
  setShipperErrorReporter(originalError);

  console.error = (...args: unknown[]): void => {
    originalError(...args);
    shipToLoki({ level: 'error', msg: formatArgs(args), fields: { source: 'console.error', stack: firstErrorStack(args) } });
  };

  console.warn = (...args: unknown[]): void => {
    originalWarn(...args);
    shipToLoki({ level: 'warn', msg: formatArgs(args), fields: { source: 'console.warn', stack: firstErrorStack(args) } });
  };

  // `uncaughtExceptionMonitor` (NOT `uncaughtException`) deliberately: it observes the error
  // without suppressing Node's default crash-and-exit behaviour. Registering the plain
  // `uncaughtException` / `unhandledRejection` / `SIGTERM` listeners would keep a broken
  // process alive, which is a far worse outcome than a missing log line. The process dies
  // immediately after this runs, so the queued line usually loses the race with the flush
  // timer — stderr (and `get-container-log`) remains the source of truth for a hard crash.
  process.on('uncaughtExceptionMonitor', (error: Error) => {
    shipToLoki({ level: 'error', msg: `Uncaught exception: ${error.message}`, fields: { source: 'uncaughtException', stack: error.stack } });
    void flushLoki();
  });

  originalWarn('[serverLogger] Grafana Cloud log shipping enabled');
}

interface RequestErrorInfo {
  path: string;
  method: string;
}

interface RequestErrorContext {
  routePath: string;
  routeType: string;
  revalidateReason?: string;
}

/**
 * Ships one server-side request error, from Next's `onRequestError` instrumentation hook.
 *
 * Note this fires only for errors Next itself catches — API routes wrapped in
 * `withErrorHandlingV1/V2` swallow their own errors and return a JSON response, so those
 * arrive via the patched `console.error` instead. Little overlap in practice.
 */
export function shipRequestError(err: unknown, request: RequestErrorInfo, context: RequestErrorContext): void {
  const error = err instanceof Error ? err : undefined;
  // React may replace the thrown error during Server Component rendering; `digest` identifies
  // the real one, and is what shows up in the browser's "Something went wrong" message.
  const digest = typeof err === 'object' && err !== null && 'digest' in err ? String((err as { digest: unknown }).digest) : undefined;

  shipToLoki({
    level: 'error',
    msg: error ? `${error.name}: ${error.message}` : String(err),
    fields: {
      source: 'onRequestError',
      path: request.path,
      method: request.method,
      routePath: context.routePath,
      routeType: context.routeType,
      revalidateReason: context.revalidateReason,
      digest,
      stack: error?.stack,
    },
  });
  void flushLoki();
}
