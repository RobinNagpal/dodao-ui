import { NextResponse } from 'next/server';

// Liveness probe for the shared Lightsail host deploy (deployments/shared-host-apps): the
// workflow polls it after a restart. Deliberately touches no database, so it answers as soon as
// the server is up and says nothing about RDS.
export const dynamic = 'force-dynamic';

export function GET(): NextResponse {
  return NextResponse.json({ status: 'ok' });
}
