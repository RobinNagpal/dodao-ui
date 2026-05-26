'use client';

import { useEffect } from 'react';

function serializeValue(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      ...((value as any).cause ? { cause: serializeValue((value as any).cause) } : {}),
    };
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>)) {
      result[key] = serializeValue((value as Record<string, unknown>)[key]);
    }
    return result;
  }
  return value;
}

/**
 * Captures the full NextAuth client error (including the nested Error's
 * name/message/stack) before NextAuth's proxyLogger serializes it with
 * URLSearchParams and POSTs it to /api/auth/_log — at which point the nested
 * error collapses to the string "[object Object]" and the stack is lost.
 *
 * NextAuth v4 has no public client logger hook, so we wrap console.error and
 * re-emit a fully serialized line whenever a "[next-auth][error]" log passes
 * through. The original console.error is restored on unmount.
 */
export default function NextAuthErrorCapture(): null {
  useEffect(() => {
    const originalConsoleError = console.error;
    let reentrant = false;

    console.error = (...args: unknown[]) => {
      originalConsoleError(...args);

      if (reentrant) return;
      const first = args[0];
      if (typeof first === 'string' && first.includes('[next-auth][error]')) {
        reentrant = true;
        try {
          const metadata = args[args.length - 1];
          originalConsoleError('[NextAuthErrorCapture] Full NextAuth client error:', first, JSON.stringify(serializeValue(metadata), null, 2));
        } catch {
          // ignore serialization failures — original log already emitted above
        } finally {
          reentrant = false;
        }
      }
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return null;
}
