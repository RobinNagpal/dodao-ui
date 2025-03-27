import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface AuthResponse {
  success: boolean;
}

async function postHandler(req: NextRequest): Promise<AuthResponse> {
  const { adminCode } = (await req.json()) as { adminCode: string };
  const validAdminCodes = process.env.ADMIN_CODES?.split(',').find((x) => x.trim() === adminCode);

  if (!validAdminCodes) {
    throw new Error('Invalid admin code');
  }

  return { success: true };
}

export const POST = withErrorHandlingV2<AuthResponse>(postHandler);
