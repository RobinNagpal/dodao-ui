import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisTemplate, AnalysisTemplateCategory, AnalysisTemplateParameter, AnalysisTemplateReport, AnalysisTemplateParameterReport } from '@prisma/client';
import { NextRequest } from 'next/server';

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

export const GET = withErrorHandlingV2<AnalysisTemplateReportWithRelations>(getHandler);
