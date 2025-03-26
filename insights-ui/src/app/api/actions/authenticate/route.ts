import { NextRequest } from 'next/server';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

interface AuthResponse {
  success: boolean;
  message?: string;
}

async function postHandler(req: NextRequest): Promise<AuthResponse> {
  const { adminCode } = await req.json();

  const validAdminCodes = process.env.ADMIN_CODES?.split(',').map((code) => code.trim()) || [];

  if (validAdminCodes.includes(adminCode)) {
    return { success: true };
  } else {
    return { success: false, message: 'Incorrect admin code' };
  }
}

export const POST = withErrorHandlingV2<AuthResponse>(postHandler);
