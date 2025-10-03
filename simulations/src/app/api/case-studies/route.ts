import { getAdminCaseStudies, getInstructorCaseStudies, getStudentCaseStudies } from '@/app/api/helpers/case-studies-util';
import { prisma } from '@/prisma';
import { CaseStudy } from '@/types';
import { CaseStudyWithRelationsForStudents, CreateCaseStudyRequest } from '@/types/api';
import { withErrorHandlingV2, withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

// GET /api/case-studies - Get case studies based on user type
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<CaseStudyWithRelationsForStudents[] | CaseStudy[]> {
  const { userId } = userContext;
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
  });

  switch (user.role) {
    case 'Admin':
      return await getAdminCaseStudies();
    case 'Instructor':
      return await getInstructorCaseStudies(user.id);
    case 'Student':
      return await getStudentCaseStudies(user.id);
    default:
      throw new Error('Invalid user type');
  }
}

// POST /api/case-studies - Create a new case study
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<CaseStudyWithRelationsForStudents> {
  const body: CreateCaseStudyRequest = await req.json();

  const caseStudy = await prisma.caseStudy.create({
    data: {
      title: body.title,
      shortDescription: body.shortDescription,
      details: body.details,
      finalSummaryPromptInstructions: body.finalSummaryPromptInstructions,
      subject: body.subject,
      createdById: userContext.userId,
      updatedById: userContext.userId,
      archive: false,
      modules: {
        create: body.modules.map((module) => ({
          title: module.title,
          shortDescription: module.shortDescription,
          details: module.details,
          orderNumber: module.orderNumber,
          createdById: userContext.userId,
          updatedById: userContext.userId,
          archive: false,
          exercises: {
            create: module.exercises.map((exercise) => ({
              title: exercise.title,
              details: exercise.details,
              promptHint: exercise.promptHint,
              gradingLogic: exercise.gradingLogic,
              promptOutputInstructions: exercise.promptOutputInstructions,
              orderNumber: exercise.orderNumber,
              createdById: userContext.userId,
              updatedById: userContext.userId,
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

export const GET = withLoggedInUser<CaseStudyWithRelationsForStudents[] | CaseStudy[]>(getHandler);
export const POST = withLoggedInUser<CaseStudyWithRelationsForStudents>(postHandler);
