import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisTemplate, AnalysisTemplateCategory, AnalysisTemplateParameter, AnalysisTemplateReport, AnalysisTemplateParameterReport } from '@prisma/client';
import { NextRequest } from 'next/server';
import { CreateAnalysisTemplateReportRequest } from '../route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

export type AnalysisTemplateReportWithRelations = AnalysisTemplateReport & {
  analysisTemplate: AnalysisTemplate & {
    categories: Array<
      AnalysisTemplateCategory & {
        analysisParameters: AnalysisTemplateParameter[];
      }
    >;
  };
  parameterReports: Array<
    AnalysisTemplateParameterReport & {
      analysisTemplateParameter: AnalysisTemplateParameter & {
        category: AnalysisTemplateCategory;
      };
    }
  >;
};

async function getHandler(req: NextRequest, context: { params: Promise<{ analysisTemplateReportId: string }> }): Promise<AnalysisTemplateReportWithRelations> {
  const { analysisTemplateReportId } = await context.params;

  const report = await prisma.analysisTemplateReport.findFirstOrThrow({
    where: {
      id: analysisTemplateReportId,
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
      parameterReports: {
        include: {
          analysisTemplateParameter: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  return report;
}

async function putHandler(req: NextRequest, context: { params: Promise<{ analysisTemplateReportId: string }> }): Promise<AnalysisTemplateReport> {
  const { analysisTemplateReportId } = await context.params;
  const body: CreateAnalysisTemplateReportRequest = await req.json();

  // Find prompt by key (required)
  const prompt = await prisma.prompt.findFirstOrThrow({
    where: {
      spaceId: KoalaGainsSpaceId,
      key: body.promptKey,
    },
  });

  const updatedReport = await prisma.analysisTemplateReport.update({
    where: {
      id: analysisTemplateReportId,
    },
    data: {
      analysisTemplateId: body.analysisTemplateId,
      promptId: prompt.id,
      promptKey: body.promptKey,
      reportName: body.reportName,
      inputObj: body.inputObj,
    },
  });

  return updatedReport;
}

async function deleteHandler(req: NextRequest, context: { params: Promise<{ analysisTemplateReportId: string }> }): Promise<{ success: boolean }> {
  const { analysisTemplateReportId } = await context.params;

  await prisma.analysisTemplateReport.delete({
    where: {
      id: analysisTemplateReportId,
    },
  });

  return { success: true };
}

export const GET = withErrorHandlingV2<AnalysisTemplateReportWithRelations>(getHandler);
export const PUT = withErrorHandlingV2<AnalysisTemplateReport>(putHandler);
export const DELETE = withErrorHandlingV2<{ success: boolean }>(deleteHandler);
