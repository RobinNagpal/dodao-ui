import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { UpdateCaseStudyRequest, CaseStudyWithRelations, DeleteResponse } from '@/types/api';

// GET /api/case-studies/[id] - Get a specific case study
async function getHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<CaseStudyWithRelations> {
  const { id } = await params;

  const caseStudy: CaseStudyWithRelations = await prisma.caseStudy.findFirstOrThrow({
    where: {
      id,
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
  });

  return caseStudy;
}

// PUT /api/case-studies/[id] - Update a case study
// This implementation preserves existing modules/exercises with IDs and archives removed ones
async function putHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<CaseStudyWithRelations> {
  const { id } = await params;
  const body: UpdateCaseStudyRequest = await req.json();

  // Get admin email from request headers
  const adminEmail: string = req.headers.get('admin-email') || 'admin@example.com';

  // Update case study with modules and exercises using transaction
  const caseStudy: CaseStudyWithRelations = await prisma.$transaction(async (tx) => {
    // Update the case study basic info
    await tx.caseStudy.update({
      where: { id },
      data: {
        title: body.title,
        shortDescription: body.shortDescription,
        details: body.details,
        finalSummaryPromptInstructions: body.finalSummaryPromptInstructions,
        subject: body.subject,
        updatedBy: adminEmail,
        archive: false,
      },
    });

    // Get existing modules and exercises to compare
    const existingModules = await tx.caseStudyModule.findMany({
      where: { caseStudyId: id, archive: false },
      include: {
        exercises: {
          where: { archive: false },
          orderBy: { orderNumber: 'asc' },
        },
      },
    });

    // Track which modules and exercises to keep
    const moduleIdsToKeep = new Set<string>();
    const exerciseIdsToKeep = new Set<string>();

    // Process each module in the request
    for (const moduleData of body.modules) {
      let moduleRecord: { id: string };

      if (moduleData.id && existingModules.find((m) => m.id === moduleData.id)) {
        // Update existing module
        moduleRecord = await tx.caseStudyModule.update({
          where: { id: moduleData.id },
          data: {
            title: moduleData.title,
            shortDescription: moduleData.shortDescription,
            details: moduleData.details,
            orderNumber: moduleData.orderNumber,
            updatedBy: adminEmail,
          },
        });
        moduleIdsToKeep.add(moduleData.id);
      } else {
        // Create new module
        moduleRecord = await tx.caseStudyModule.create({
          data: {
            caseStudyId: id,
            title: moduleData.title,
            shortDescription: moduleData.shortDescription,
            details: moduleData.details,
            orderNumber: moduleData.orderNumber,
            createdBy: adminEmail,
            updatedBy: adminEmail,
            archive: false,
          },
        });
        moduleIdsToKeep.add(moduleRecord.id);
      }

      // Process exercises for this module
      const existingModule = existingModules.find((m) => m.id === moduleRecord.id);

      for (const exerciseData of moduleData.exercises) {
        if (exerciseData.id && existingModule?.exercises.find((e) => e.id === exerciseData.id)) {
          // Update existing exercise
          await tx.moduleExercise.update({
            where: { id: exerciseData.id },
            data: {
              title: exerciseData.title,
              shortDescription: exerciseData.shortDescription,
              details: exerciseData.details,
              promptHint: exerciseData.promptHint,
              orderNumber: exerciseData.orderNumber,
              updatedBy: adminEmail,
            },
          });
          exerciseIdsToKeep.add(exerciseData.id);
        } else {
          // Create new exercise
          const newExercise = await tx.moduleExercise.create({
            data: {
              moduleId: moduleRecord.id,
              title: exerciseData.title,
              shortDescription: exerciseData.shortDescription,
              details: exerciseData.details,
              promptHint: exerciseData.promptHint,
              orderNumber: exerciseData.orderNumber,
              createdBy: adminEmail,
              updatedBy: adminEmail,
              archive: false,
            },
          });
          exerciseIdsToKeep.add(newExercise.id);
        }
      }
    }

    // Archive exercises that are no longer in the request
    // First archive exercise attempts for exercises that will be archived
    await tx.exerciseAttempt.updateMany({
      where: {
        exercise: {
          module: { caseStudyId: id },
          archive: false,
          NOT: { id: { in: Array.from(exerciseIdsToKeep) } },
        },
        archive: false,
      },
      data: { archive: true },
    });

    // Then archive the exercises themselves
    await tx.moduleExercise.updateMany({
      where: {
        module: { caseStudyId: id },
        archive: false,
        NOT: { id: { in: Array.from(exerciseIdsToKeep) } },
      },
      data: { archive: true },
    });

    // Archive modules that are no longer in the request
    await tx.caseStudyModule.updateMany({
      where: {
        caseStudyId: id,
        archive: false,
        NOT: { id: { in: Array.from(moduleIdsToKeep) } },
      },
      data: { archive: true },
    });

    // Return the updated case study with all relations
    return await tx.caseStudy.findUniqueOrThrow({
      where: { id },
      include: {
        modules: {
          where: { archive: false },
          include: {
            exercises: {
              where: { archive: false },
              orderBy: { orderNumber: 'asc' },
            },
          },
          orderBy: { orderNumber: 'asc' },
        },
      },
    });
  });

  return caseStudy;
}

// DELETE /api/case-studies/[id] - Delete a case study
async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<DeleteResponse> {
  const { id } = await params;

  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // First, archive all exercise attempts for exercises in this case study's modules
    await tx.exerciseAttempt.updateMany({
      where: {
        exercise: {
          module: {
            caseStudyId: id,
          },
        },
        archive: false,
      },
      data: {
        archive: true,
      },
    });

    // Then archive all exercises in this case study's modules
    await tx.moduleExercise.updateMany({
      where: {
        module: {
          caseStudyId: id,
        },
        archive: false,
      },
      data: {
        archive: true,
      },
    });

    // Archive all modules for this case study
    await tx.caseStudyModule.updateMany({
      where: {
        caseStudyId: id,
        archive: false,
      },
      data: {
        archive: true,
      },
    });

    // Archive all final submissions for students in this case study
    await tx.finalSubmission.updateMany({
      where: {
        student: {
          enrollment: {
            caseStudyId: id,
          },
        },
        archive: false,
      },
      data: {
        archive: true,
      },
    });

    // Archive all enrollment students for enrollments of this case study
    await tx.enrollmentStudent.updateMany({
      where: {
        enrollment: {
          caseStudyId: id,
        },
        archive: false,
      },
      data: {
        archive: true,
      },
    });

    // Archive all enrollments for this case study
    await tx.classCaseStudyEnrollment.updateMany({
      where: {
        caseStudyId: id,
        archive: false,
      },
      data: {
        archive: true,
      },
    });

    // Finally, archive the case study itself
    await tx.caseStudy.update({
      where: { id },
      data: {
        archive: true,
      },
    });
  });

  return { message: 'Case study deleted successfully' };
}

export const GET = withErrorHandlingV2<CaseStudyWithRelations>(getHandler);
export const PUT = withErrorHandlingV2<CaseStudyWithRelations>(putHandler);
export const DELETE = withErrorHandlingV2<DeleteResponse>(deleteHandler);
