import type { NextRequest } from 'next/server';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import type { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { prisma } from '@/prisma';
import type { CaseStudyModule, ModuleExercise } from '@prisma/client';
import { checkCanEditCaseStudy } from '@/app/api/helpers/case-studies-util';

type CaseStudyModuleWithExercises = CaseStudyModule & { exercises: ModuleExercise[] };

interface UpdateCaseStudyModuleRequest {
  title?: string;
  shortDescription?: string;
  details?: string;
  orderNumber?: number;
  archive?: boolean;
}

// GET /api/case-study-modules/[id]
async function getByIdHandler(
  _req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  dynamic: { params: Promise<{ caseStudyId: string; moduleId: string }> }
): Promise<CaseStudyModuleWithExercises> {
  const { caseStudyId, moduleId } = await dynamic.params;
  await checkCanEditCaseStudy(userContext, caseStudyId);

  const moduleRecord: CaseStudyModuleWithExercises = await prisma.caseStudyModule.findFirstOrThrow({
    where: { id: moduleId },
    include: {
      exercises: {
        where: { archive: false },
        orderBy: { orderNumber: 'asc' },
      },
    },
  });

  return moduleRecord;
}

// PATCH /api/case-study-modules/[id]
async function patchHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  dynamic: { params: Promise<{ caseStudyId: string; moduleId: string }> }
): Promise<CaseStudyModuleWithExercises> {
  const { caseStudyId, moduleId } = await dynamic.params;
  await checkCanEditCaseStudy(userContext, caseStudyId);

  const body: UpdateCaseStudyModuleRequest = await req.json();

  const updated: CaseStudyModuleWithExercises = await prisma.caseStudyModule.update({
    where: { id: moduleId },
    data: {
      title: body.title,
      shortDescription: body.shortDescription,
      details: body.details,
      orderNumber: body.orderNumber,
      archive: body.archive,
      updatedById: userContext.userId,
    },
    include: {
      exercises: {
        where: { archive: false },
        orderBy: { orderNumber: 'asc' },
      },
    },
  });

  return updated;
}

// DELETE /api/case-study-modules/[id]
async function deleteHandler(
  _req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  dynamic: { params: Promise<{ caseStudyId: string; moduleId: string }> }
): Promise<CaseStudyModuleWithExercises> {
  const { caseStudyId, moduleId } = await dynamic.params;

  await checkCanEditCaseStudy(userContext, caseStudyId);

  const archived: CaseStudyModuleWithExercises = await prisma.caseStudyModule.update({
    where: { id: moduleId },
    data: {
      archive: true,
      updatedById: userContext.userId,
    },
    include: {
      exercises: {
        where: { archive: false },
        orderBy: { orderNumber: 'asc' },
      },
    },
  });

  return archived;
}

export const GET = withLoggedInUser<CaseStudyModuleWithExercises>(getByIdHandler);
export const PATCH = withLoggedInUser<CaseStudyModuleWithExercises>(patchHandler);
export const DELETE = withLoggedInUser<CaseStudyModuleWithExercises>(deleteHandler);
