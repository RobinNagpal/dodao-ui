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
        subject: body.subject,
        updatedBy: adminEmail,
        archive: false,
      },
    });

    // Delete existing exercises first, then modules (due to foreign key constraints)
    await tx.moduleExercise.deleteMany({
      where: {
        module: {
          caseStudyId: id,
        },
      },
    });

    // Now delete the modules
    await tx.caseStudyModule.deleteMany({
      where: { caseStudyId: id },
    });

    // Create new modules and exercises
    for (const caseStudyModule of body.modules) {
      await tx.caseStudyModule.create({
        data: {
          caseStudyId: id,
          title: caseStudyModule.title,
          shortDescription: caseStudyModule.shortDescription,
          details: caseStudyModule.details,
          orderNumber: caseStudyModule.orderNumber,
          createdBy: adminEmail,
          updatedBy: adminEmail,
          archive: false,
          exercises: {
            create: caseStudyModule.exercises.map((exercise) => ({
              title: exercise.title,
              shortDescription: exercise.shortDescription,
              details: exercise.details,
              orderNumber: exercise.orderNumber,
              createdBy: adminEmail,
              updatedBy: adminEmail,
              archive: false,
            })),
          },
        },
      });
    }

    // Return the updated case study with all relations
    return await tx.caseStudy.findUniqueOrThrow({
      where: { id },
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
