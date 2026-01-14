import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisTemplate } from '@prisma/client';
import { NextRequest } from 'next/server';

/** ---------- Types ---------- */

interface CreateAnalysisTemplateRequest {
  name: string;
  description?: string;
}

interface AnalysisTemplateWithRelations extends AnalysisTemplate {
  categories: Array<{
    id: string;
    name: string;
    description: string | null;
    analysisTypes: Array<{
      id: string;
      name: string;
      oneLineSummary: string;
      description: string;
      promptInstructions: string;
      outputSchema: string | null;
    }>;
  }>;
}

/** ---------- GET ---------- */

async function getHandler(): Promise<AnalysisTemplateWithRelations[]> {
  const templates = await prisma.analysisTemplate.findMany({
    include: {
      categories: {
        include: {
          analysisTypes: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return templates;
}

/** ---------- POST ---------- */

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
          analysisTypes: true,
        },
      },
    },
  });

  return createdTemplate;
}

export const GET = withErrorHandlingV2<AnalysisTemplateWithRelations[]>(getHandler);
export const POST = withErrorHandlingV2<AnalysisTemplateWithRelations>(postHandler);
