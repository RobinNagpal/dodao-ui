import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { CreateCaseStudyRequest, CaseStudyWithRelations } from '@/types/api';

// GET /api/case-studies - Get all case studies
async function getHandler(): Promise<CaseStudyWithRelations[]> {
  const caseStudies: CaseStudyWithRelations[] = await prisma.caseStudy.findMany({
    where: {
      archive: false,
    },
    include: {
      modules: {
        where: {
          archive: false,
        },
        include: {
          exercises: {
            where: {
              archive: false,
            },
            orderBy: {
              orderNumber: 'asc',
            },
          },
        },
        orderBy: {
          orderNumber: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return caseStudies;
}

// POST /api/case-studies - Create a new case study
async function postHandler(req: NextRequest): Promise<CaseStudyWithRelations> {
  const body: CreateCaseStudyRequest = await req.json();

  // Get admin email from request headers or we could implement auth middleware
  // For now, using a placeholder - this should be replaced with actual auth
  const adminEmail: string = req.headers.get('admin-email') || 'admin@example.com';

  const caseStudy: CaseStudyWithRelations = await prisma.caseStudy.create({
    data: {
      title: body.title,
      shortDescription: body.shortDescription,
      details: body.details,
      finalSummaryPromptInstructions: body.finalSummaryPromptInstructions,
      subject: body.subject,
      createdBy: adminEmail,
      updatedBy: adminEmail,
      archive: false,
      modules: {
        create: body.modules.map((module) => ({
          title: module.title,
          shortDescription: module.shortDescription,
          details: module.details,
          orderNumber: module.orderNumber,
          createdBy: adminEmail,
          updatedBy: adminEmail,
          archive: false,
          exercises: {
            create: module.exercises.map((exercise) => ({
              title: exercise.title,
              shortDescription: exercise.shortDescription,
              details: exercise.details,
              promptHint: exercise.promptHint,
              orderNumber: exercise.orderNumber,
              createdBy: adminEmail,
              updatedBy: adminEmail,
              archive: false,
            })),
          },
        })),
      },
    },
    include: {
      modules: {
        include: {
          exercises: {
            orderBy: {
              orderNumber: 'asc',
            },
          },
        },
        orderBy: {
          orderNumber: 'asc',
        },
      },
    },
  });

  return caseStudy;
}

export const GET = withErrorHandlingV2<CaseStudyWithRelations[]>(getHandler);
export const POST = withErrorHandlingV2<CaseStudyWithRelations>(postHandler);
