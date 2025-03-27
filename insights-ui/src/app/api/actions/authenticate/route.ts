import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface AuthResponse {
  success: boolean;
}

async function postHandler(req: NextRequest): Promise<AuthResponse> {
  const { adminCode } = await req.json();
  const validAdminCodes = process.env.ADMIN_CODES?.split(',').map((x) => x.trim()) || [];

  if (!validAdminCodes.includes(adminCode)) {
    throw {
      response: {
        data: 'Incorrect admin code',
      },
    };
  }

  return { success: true };
}

export const POST = withErrorHandlingV2<AuthResponse>(postHandler);
