import { prisma } from '@/prisma';
import { NextResponse } from 'next/server';

// Liveness/readiness probe for the Lightsail container health check, the Dockerfile
// HEALTHCHECK, and the CI smoke test. Pings the DB so an unreachable RDS marks the
// container unhealthy (and the rolling deploy holds the previous version).
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ status: 'error', error: e instanceof Error ? e.message : 'db unreachable' }, { status: 503 });
  }
}
