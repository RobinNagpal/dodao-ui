import { checkCanAccessCaseStudy, checkCanEditCaseStudy } from '@/app/api/helpers/case-studies-util';
import type { NextRequest } from 'next/server';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import type { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { prisma } from '@/prisma';
import type { ModuleExercise } from '@prisma/client';
import { ExerciseWithAttemptsResponse } from '@/types/api';

type ExerciseEntity = ModuleExercise;

export interface UpdateModuleExerciseRequest {
  title: string;
  details: string;
  promptHint?: string | null;
  gradingLogic?: string | null;
  instructorInstructions?: string | null;
  promptOutputInstructions?: string | null;
  promptCharacterLimit: number;
  orderNumber: number;
  archive: boolean;
}

// Helper function to get simplified student exercise data
async function getSimplifiedStudentExerciseData(exerciseId: string, userId: string): Promise<ExerciseWithAttemptsResponse> {
  // Get exercise with attempts
  const exercise = await prisma.moduleExercise.findFirstOrThrow({
    where: {
      id: exerciseId,
      archive: false,
    },
    include: {
      attempts: {
        where: {
          createdById: userId,
          archive: false,
        },
        orderBy: {
          attemptNumber: 'asc',
        },
      },
    },
  });

  return {
    id: exercise.id,
    title: exercise.title,
    details: exercise.details,
    promptHint: exercise.promptHint,
    orderNumber: exercise.orderNumber,
    promptCharacterLimit: exercise.promptCharacterLimit,
    attempts: exercise.attempts,
  };
}

// GET /api/case-studies/[caseStudyId]/case-study-modules/[moduleId]/exercises/[exerciseId]
async function getByIdHandler(
  _req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  dynamic: { params: Promise<{ caseStudyId: string; moduleId: string; exerciseId: string }> }
): Promise<ModuleExercise | ExerciseWithAttemptsResponse> {
  const { caseStudyId, moduleId, exerciseId } = await dynamic.params;
  const { userId } = userContext;

  // Check user role
  const user = await prisma.user.findFirstOrThrow({
    where: { id: userId },
  });

  // For students, return simplified exercise data with attempts only
  if (user.role === 'Student') {
    return await getSimplifiedStudentExerciseData(exerciseId, userId);
  }

  await checkCanAccessCaseStudy(userContext, caseStudyId);

  // For admin/instructor, return basic exercise data
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
      promptCharacterLimit: body.promptCharacterLimit,
      promptOutputInstructions: body.promptOutputInstructions,
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

export const GET = withLoggedInUser<ModuleExercise | ExerciseWithAttemptsResponse>(getByIdHandler);
export const PUT = withLoggedInUser<ExerciseEntity>(putHandler);
export const DELETE = withLoggedInUser<ExerciseEntity>(deleteHandler);
