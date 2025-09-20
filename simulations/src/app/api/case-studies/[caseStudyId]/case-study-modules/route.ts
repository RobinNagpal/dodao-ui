import { checkCanEditCaseStudy } from '@/app/api/helpers/case-studies-util';
import type { NextRequest } from 'next/server';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import type { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { prisma } from '@/prisma';
import type { CaseStudyModule, ModuleExercise } from '@prisma/client';

type CaseStudyModuleWithExercises = CaseStudyModule & { exercises: ModuleExercise[] };

interface CreateModuleExerciseInput {
  title: string;
  shortDescription: string;
  details: string;
  promptHint?: string | null;
  instructorInstructions?: string | null;
  orderNumber: number;
}

interface CreateCaseStudyModuleRequest {
  caseStudyId: string;
  title: string;
  shortDescription: string;
  details: string;
  orderNumber: number;
  exercises?: CreateModuleExerciseInput[];
}

// GET /api/case-study-modules?caseStudyId=...
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string }> }
): Promise<CaseStudyModuleWithExercises[]> {
  const { caseStudyId } = await params;

  const { caseStudy, user } = await checkCanEditCaseStudy(userContext, caseStudyId);

  const modules: CaseStudyModuleWithExercises[] = await prisma.caseStudyModule.findMany({
    where: { caseStudyId, archive: false },
    include: {
      exercises: {
        where: { archive: false },
        orderBy: { orderNumber: 'asc' },
      },
    },
    orderBy: { orderNumber: 'asc' },
  });

  return modules;
}

// POST /api/case-study-modules
async function postHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string }> }
): Promise<CaseStudyModuleWithExercises> {
  const { caseStudyId } = await params;

  const { caseStudy, user } = await checkCanEditCaseStudy(userContext, caseStudyId);

  const body: CreateCaseStudyModuleRequest = await req.json();

  const created: CaseStudyModuleWithExercises = await prisma.caseStudyModule.create({
    data: {
      caseStudyId: body.caseStudyId,
      title: body.title,
      shortDescription: body.shortDescription,
      details: body.details,
      orderNumber: body.orderNumber,
      createdById: userContext.userId,
      updatedById: userContext.userId,
      archive: false,
      exercises:
        body.exercises && body.exercises.length > 0
          ? {
              create: body.exercises.map((ex) => ({
                title: ex.title,
                shortDescription: ex.shortDescription,
                details: ex.details,
                promptHint: ex.promptHint ?? null,
                instructorInstructions: ex.instructorInstructions ?? null,
                orderNumber: ex.orderNumber,
                createdById: userContext.userId,
                updatedById: userContext.userId,
                archive: false,
              })),
            }
          : undefined,
    },
    include: {
      exercises: {
        where: { archive: false },
        orderBy: { orderNumber: 'asc' },
      },
    },
  });

  return created;
}

export const GET = withLoggedInUser<CaseStudyModuleWithExercises[]>(getHandler);
export const POST = withLoggedInUser<CaseStudyModuleWithExercises>(postHandler);
