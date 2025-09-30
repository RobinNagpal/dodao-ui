import { checkCanAccessCaseStudy, checkCanEditCaseStudy } from '@/app/api/helpers/case-studies-util';
import type { NextRequest } from 'next/server';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import type { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { prisma } from '@/prisma';
import type { ModuleExercise } from '@prisma/client';

// Narrow response type alias for clarity
type ExerciseEntity = ModuleExercise;

interface CreateModuleExerciseRequest {
  moduleId: string;
  title: string;
  details: string;
  promptHint?: string | null;
  instructorInstructions?: string | null;
  promptCharacterLimit: number;
  promptOutputInstructions?: string | null;
  orderNumber: number;
}

// GET /api/module-exercises?moduleId=...
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  dynamic: { params: Promise<{ caseStudyId: string; moduleId: string }> }
): Promise<ExerciseEntity[]> {
  const { caseStudyId, moduleId } = await dynamic.params;
  await checkCanAccessCaseStudy(userContext, caseStudyId);

  const exercises: ExerciseEntity[] = await prisma.moduleExercise.findMany({
    where: { moduleId, archive: false },
    orderBy: { orderNumber: 'asc' },
  });

  return exercises;
}

// POST /api/module-exercises
async function postHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  dynamic: { params: Promise<{ caseStudyId: string; moduleId: string }> }
): Promise<ExerciseEntity> {
  const { caseStudyId } = await dynamic.params;
  await checkCanEditCaseStudy(userContext, caseStudyId);

  const body: CreateModuleExerciseRequest = await req.json();

  const created: ExerciseEntity = await prisma.moduleExercise.create({
    data: {
      moduleId: body.moduleId,
      title: body.title,
      details: body.details,
      promptHint: body.promptHint ?? null,
      instructorInstructions: body.instructorInstructions ?? null,
      promptCharacterLimit: body.promptCharacterLimit,
      promptOutputInstructions: body.promptOutputInstructions,
      orderNumber: body.orderNumber,
      createdById: userContext.userId,
      updatedById: userContext.userId,
      archive: false,
    },
  });

  return created;
}

export const GET = withLoggedInUser<ExerciseEntity[]>(getHandler);
export const POST = withLoggedInUser<ExerciseEntity>(postHandler);
