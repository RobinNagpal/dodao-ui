import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { validateApiKey } from '@/app/api/helpers/validateApiKey';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { v4 as uuidv4 } from 'uuid';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { emptyClickableDemo } from '@/components/clickableDemos/Edit/EmptyClickableDemo';

async function postHandler(req: NextRequest, { params }: { params: { spaceId: string } }) {
  const apiKey = req.headers.get('X-API-KEY');
  const spaceById = await getSpaceById(params.spaceId);
  if (apiKey) {
    await validateApiKey(apiKey, params.spaceId);
  } else {
    await checkEditSpacePermission(spaceById, req);
  }

  const body = await req.json();
  if (!body) return NextResponse.json({ message: 'body is required' }, { status: 400 });
  const { demoName, demoDescription } = body;
  if (!demoName || !demoDescription) return NextResponse.json({ message: 'both demoName and description is required' }, { status: 400 });

  const emptyClickableDemoModel = emptyClickableDemo();

  const clickableDemo = await prisma.clickableDemos.create({
    data: {
      id: slugify(demoName) + '-' + uuidv4().toString().substring(0, 4),
      spaceId: params.spaceId,
      title: demoName,
      excerpt: demoDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
      steps: emptyClickableDemoModel.steps,
    },
  });

  return NextResponse.json({ clickableDemo }, { status: 200 });
}

export const POST = withErrorHandling(postHandler);
