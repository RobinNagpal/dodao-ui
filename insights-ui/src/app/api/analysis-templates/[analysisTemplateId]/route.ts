import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisTemplateWithRelations, CreateAnalysisTemplateRequest } from '../route';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

async function getHandler(req: Request, context: { params: Promise<{ analysisTemplateId: string }> }): Promise<AnalysisTemplateWithRelations> {
  const { analysisTemplateId } = await context.params;

  const template = await prisma.analysisTemplate.findFirstOrThrow({
    where: {
      id: analysisTemplateId,
    },
    include: {
      categories: {
        include: {
          analysisTypes: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  return template;
}

async function putHandler(req: NextRequest, context: { params: Promise<{ analysisTemplateId: string }> }): Promise<AnalysisTemplateWithRelations> {
  const { analysisTemplateId } = await context.params;
  const body: CreateAnalysisTemplateRequest = await req.json();

  // Find prompt by key (required)
  const prompt = await prisma.prompt.findFirstOrThrow({
    where: {
      spaceId: KoalaGainsSpaceId,
      key: body.promptKey,
    },
  });

  const updatedTemplate = await prisma.analysisTemplate.update({
    where: {
      id: analysisTemplateId,
    },
    data: {
      name: body.name,
      description: body.description,
      promptId: prompt.id,
      promptKey: body.promptKey,
    },
    include: {
      categories: {
        include: {
          analysisTypes: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  return updatedTemplate;
}

export const GET = withErrorHandlingV2<AnalysisTemplateWithRelations>(getHandler);
export const PUT = withErrorHandlingV2<AnalysisTemplateWithRelations>(putHandler);
