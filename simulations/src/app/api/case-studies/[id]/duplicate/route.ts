import { withLoggedInAdmin } from '@/app/api/helpers/withLoggedInAdmin';
import { prisma } from '@/prisma';
import type { CaseStudyWithRelationsForStudents } from '@/types/api';
import type { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import type { BusinessSubject, Prisma, UserRole } from '@prisma/client';
import { NextRequest } from 'next/server';

/** Strict body schema for duplication */
type DuplicateCaseStudyRequest = Readonly<{
  /** Optional explicit title for the duplicated case study. If omitted, "(Copy)" will be appended. */
  title?: string;
  /** Whether to copy the editors array from the source. Defaults to false. */
  copyEditors?: boolean;
}>;

/** Type guard & sanitizer for the request body */
function parseDuplicateBody(input: unknown): DuplicateCaseStudyRequest {
  if (input === null || typeof input !== 'object') return {};
  const { title, copyEditors, ...rest } = input as Record<string, unknown>;

  // Disallow unknown keys strictly
  const extraKeys = Object.keys(rest ?? {});
  if (extraKeys.length > 0) {
    throw new Error(`Unknown body keys: ${extraKeys.join(', ')}`);
  }

  if (title !== undefined && typeof title !== 'string') {
    throw new Error('If provided, "title" must be a string.');
  }
  if (copyEditors !== undefined && typeof copyEditors !== 'boolean') {
    throw new Error('If provided, "copyEditors" must be a boolean.');
  }

  return {
    title,
    copyEditors: copyEditors ?? false,
  };
}

/** Minimal shape we need from the source case study */
type SourceExercise = {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  promptHint: string | null;
  orderNumber: number;
};

type SourceModule = {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  orderNumber: number;
  exercises: SourceExercise[];
};

type SourceCaseStudy = {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  subject: BusinessSubject;
  finalSummaryPromptInstructions: string | null;
  editors: string[];
  modules: SourceModule[];
};

/** POST /api/case-studies/[id]/duplicate — Duplicate a case study (structure only, no enrollments/responses) */
async function postHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<CaseStudyWithRelationsForStudents> {
  const { id: sourceId } = await params;

  // Load the user & enforce Admin role
  const { userId } = userContext;
  if (!userId) throw new Error('Unauthorized: missing user context.');

  const actingUser = await prisma.user.findFirstOrThrow({
    where: { id: userId },
    select: { id: true, role: true, email: true },
  });

  if ((actingUser.role as UserRole) !== 'Admin') {
    throw new Error('Only Admin users can duplicate case studies.');
  }

  // Parse & validate request body
  let body: DuplicateCaseStudyRequest = {};
  try {
    // Body may be empty; treat as {}
    const raw = await req.json().catch(() => ({}));
    body = parseDuplicateBody(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request body.';
    throw new Error(message);
  }

  // Fetch source case study (structure only: modules + exercises)
  const source = (await prisma.caseStudy.findFirstOrThrow({
    where: { id: sourceId, archive: false },
    include: {
      modules: {
        where: { archive: false },
        orderBy: { orderNumber: 'asc' },
        include: {
          exercises: {
            where: { archive: false },
            orderBy: { orderNumber: 'asc' },
          },
        },
      },
    },
  })) as unknown as SourceCaseStudy;

  // Determine new title and admin email
  const adminEmailHeader: string | null = req.headers.get('admin-email');
  const adminEmail: string = (adminEmailHeader && adminEmailHeader.trim().length > 0 ? adminEmailHeader : undefined) ?? actingUser.email ?? 'admin@example.com';

  const newTitle: string = body.title && body.title.trim().length > 0 ? body.title.trim() : `${source.title} (Copy)`;

  // Perform deep duplication in a transaction
  const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1) Create the new case study (no enrollments/responses will be created)
    const newCase = await tx.caseStudy.create({
      data: {
        title: newTitle,
        shortDescription: source.shortDescription,
        details: source.details,
        subject: source.subject,
        finalSummaryPromptInstructions: source.finalSummaryPromptInstructions,
        editors: body.copyEditors ? source.editors : [],
        createdById: userId,
        updatedById: userId,
        archive: false,
      },
      select: { id: true },
    });

    // 2) Recreate modules
    for (const mod of source.modules.sort((a, b) => a.orderNumber - b.orderNumber)) {
      const newMod = await tx.caseStudyModule.create({
        data: {
          caseStudyId: newCase.id,
          title: mod.title,
          shortDescription: mod.shortDescription,
          details: mod.details,
          orderNumber: mod.orderNumber,
          createdById: userContext.userId,
          updatedById: userContext.userId,
          archive: false,
        },
        select: { id: true },
      });

      // 3) Recreate exercises under each module
      if (mod.exercises.length > 0) {
        for (const ex of mod.exercises.sort((a, b) => a.orderNumber - b.orderNumber)) {
          await tx.moduleExercise.create({
            data: {
              moduleId: newMod.id,
              title: ex.title,
              shortDescription: ex.shortDescription,
              details: ex.details,
              promptHint: ex.promptHint,
              orderNumber: ex.orderNumber,
              createdById: userContext.userId,
              updatedById: userContext.userId,
              archive: false,
            },
          });
        }
      }
    }

    // 4) Return the fully-hydrated new case study with relations
    const duplicated = await tx.caseStudy.findUniqueOrThrow({
      where: { id: newCase.id },
      include: {
        modules: {
          where: { archive: false },
          orderBy: { orderNumber: 'asc' },
          include: {
            exercises: {
              where: { archive: false },
              orderBy: { orderNumber: 'asc' },
            },
          },
        },
      },
    });

    // Typing: ensure we return the expected API type (structure only; no enrollments/responses)
    return duplicated as unknown as CaseStudyWithRelationsForStudents;
  });

  return created;
}

export const POST = withLoggedInAdmin<CaseStudyWithRelationsForStudents>(postHandler);
