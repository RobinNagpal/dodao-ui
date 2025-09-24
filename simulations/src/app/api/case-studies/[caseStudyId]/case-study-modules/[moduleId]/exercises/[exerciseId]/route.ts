import { checkCanAccessCaseStudy, checkCanEditCaseStudy } from '@/app/api/helpers/case-studies-util';
import type { NextRequest } from 'next/server';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import type { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { prisma } from '@/prisma';
import type { ModuleExercise } from '@prisma/client';

type ExerciseEntity = ModuleExercise;

export interface UpdateModuleExerciseRequest {
  title: string;
  details: string;
  promptHint?: string | null;
  gradingLogic?: string | null;
  instructorInstructions?: string | null;
  orderNumber: number;
  archive: boolean;
}

// GET /api/module-exercises/[id]
async function getByIdHandler(
  _req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  dynamic: { params: Promise<{ caseStudyId: string; moduleId: string; exerciseId: string }> }
): Promise<ModuleExercise> {
  const { caseStudyId, moduleId, exerciseId } = await dynamic.params;

  await checkCanAccessCaseStudy(userContext, caseStudyId);

  const exercise: ExerciseEntity = await prisma.moduleExercise.findFirstOrThrow({
    where: { id: exerciseId },
  });

  return exercise;
}

// PATCH /api/module-exercises/[id]
async function putHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  dynamic: { params: Promise<{ caseStudyId: string; moduleId: string; exerciseId: string }> }
): Promise<ModuleExercise> {
  const { caseStudyId, moduleId, exerciseId } = await dynamic.params;
  await checkCanEditCaseStudy(userContext, caseStudyId);

  const body: UpdateModuleExerciseRequest = await req.json();

  const updated: ExerciseEntity = await prisma.moduleExercise.update({
    where: { id: exerciseId },
    data: {
      title: body.title,
      details: body.details,
      promptHint: body.promptHint ?? undefined,
      gradingLogic: body.gradingLogic ?? undefined,
      instructorInstructions: body.instructorInstructions ?? undefined,
      orderNumber: body.orderNumber,
      archive: body.archive,
      updatedById: userContext.userId,
    },
  });

  return updated;
}

// DELETE /api/module-exercises/[id]
async function deleteHandler(
  _req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  dynamic: { params: Promise<{ caseStudyId: string; moduleId: string; exerciseId: string }> }
): Promise<ModuleExercise> {
  const { caseStudyId, moduleId, exerciseId } = await dynamic.params;
  await checkCanEditCaseStudy(userContext, caseStudyId);

  const archived: ExerciseEntity = await prisma.moduleExercise.update({
    where: { id: exerciseId },
    data: {
      archive: true,
      updatedById: userContext.userId,
    },
  });

  return archived;
}

export const GET = withLoggedInUser<ExerciseEntity>(getByIdHandler);
export const PUT = withLoggedInUser<ExerciseEntity>(putHandler);
export const DELETE = withLoggedInUser<ExerciseEntity>(deleteHandler);
