import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { v4 as uuidv4 } from 'uuid';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { emptyClickableDemo } from '@/components/clickableDemos/Edit/EmptyClickableDemo';

async function postHandler(req: NextRequest) {
  const headers = req.headers;
  const apiKey = headers.get('X-API-KEY');
  if (!apiKey) return NextResponse.json({ message: 'apiKey is required' }, { status: 400 });
  const body = await req.json();
  if (!body) return NextResponse.json({ message: 'body is required' }, { status: 400 });
  const { demoName, demoDescription } = body;
  if (!demoName || !demoDescription) return NextResponse.json({ message: 'both demoName and description is required' }, { status: 400 });

  const emptyClickableDemoModel = emptyClickableDemo();

  // Fetch all space integrations that might contain any API keys
  const allSpaceIntegrations = await prisma.spaceIntegration.findMany({
    where: {
      // Optionally add broader conditions here if they can help narrow down the dataset
    },
  });

  // Filter in the application to find the first integration with a matching API key
  const spaceIntegration = allSpaceIntegrations.find(
    (integration) => integration.spaceApiKeys && integration.spaceApiKeys.some((key) => key.apiKey === apiKey)
  );

  const spaceId = spaceIntegration?.spaceId;

  const clickableDemo = await prisma.clickableDemos.create({
    data: {
      id: slugify(demoName) + '-' + uuidv4().toString().substring(0, 4),
      spaceId: spaceId!,
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
