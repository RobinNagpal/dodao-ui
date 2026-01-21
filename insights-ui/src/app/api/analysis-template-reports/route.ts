import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisTemplate, AnalysisTemplateCategory, AnalysisTemplateParameter, AnalysisTemplateReport, AnalysisTemplateParameterReport } from '@prisma/client';
import { NextRequest } from 'next/server';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

export interface CreateAnalysisTemplateReportRequest {
  analysisTemplateId: string;
  promptKey: string;
  inputObj: any;
}

export type AnalysisTemplateReportWithRelations = AnalysisTemplateReport & {
  analysisTemplate: AnalysisTemplate & {
    categories: Array<
      AnalysisTemplateCategory & {
        analysisParameters: AnalysisTemplateParameter[];
      }
    >;
  };
  parameterReports: AnalysisTemplateParameterReport[];
};

async function getHandler(): Promise<AnalysisTemplateReportWithRelations[]> {
  const reports = await prisma.analysisTemplateReport.findMany({
    include: {
      analysisTemplate: {
        include: {
          categories: {
            include: {
              analysisParameters: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      },
      parameterReports: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return reports;
}

async function postHandler(req: NextRequest): Promise<AnalysisTemplateReportWithRelations> {
  const body: CreateAnalysisTemplateReportRequest = await req.json();

  // Find prompt by key (required)
  const prompt = await prisma.prompt.findFirstOrThrow({
    where: {
      spaceId: KoalaGainsSpaceId,
      key: body.promptKey,
    },
  });

  const createdReport = await prisma.analysisTemplateReport.create({
    data: {
      analysisTemplateId: body.analysisTemplateId,
      promptId: prompt.id,
      promptKey: body.promptKey,
      inputObj: body.inputObj,
    },
    include: {
      analysisTemplate: {
        include: {
          categories: {
            include: {
              analysisParameters: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      },
      parameterReports: true,
    },
  });

  return createdReport;
}

export const GET = withErrorHandlingV2<AnalysisTemplateReportWithRelations[]>(getHandler);
export const POST = withErrorHandlingV2<AnalysisTemplateReportWithRelations>(postHandler);
