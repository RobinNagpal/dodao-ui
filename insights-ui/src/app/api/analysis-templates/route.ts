import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisTemplate, AnalysisTemplateCategory, AnalysisTemplateParameter } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface CreateAnalysisTemplateRequest {
  name: string;
  description?: string;
}

export type AnalysisTemplateWithRelations = AnalysisTemplate & {
  categories: Array<
    AnalysisTemplateCategory & {
      analysisParameters: AnalysisTemplateParameter[];
    }
  >;
};

async function getHandler(): Promise<AnalysisTemplateWithRelations[]> {
  const templates = await prisma.analysisTemplate.findMany({
    include: {
      categories: {
        include: {
          analysisParameters: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return templates;
}

async function postHandler(req: NextRequest): Promise<AnalysisTemplateWithRelations> {
  const body: CreateAnalysisTemplateRequest = await req.json();

  const createdTemplate = await prisma.analysisTemplate.create({
    data: {
      name: body.name,
      description: body.description,
    },
    include: {
      categories: {
        include: {
          analysisParameters: true,
        },
      },
    },
  });

  return createdTemplate;
}

export const GET = withErrorHandlingV2<AnalysisTemplateWithRelations[]>(getHandler);
export const POST = withErrorHandlingV2<AnalysisTemplateWithRelations>(postHandler);
