import { withErrorHandlingV1 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(req: NextRequest) {
  const reqBody = await req.json();
  const { key } = reqBody;

  if (key != process.env.ADMIN_KEY) {
    console.log('Invalid key');
    return NextResponse.json({ error: 'Invalid key' }, { status: 401 });
  }
  return NextResponse.json({ key }, { status: 200 });
}

export const POST = withErrorHandlingV1(postHandler);
