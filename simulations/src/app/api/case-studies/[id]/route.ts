import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { UpdateCaseStudyRequest, CaseStudyWithRelations, DeleteResponse } from '@/types/api';

// GET /api/case-studies/[id] - Get a specific case study
async function getHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<CaseStudyWithRelations> {
  const { id } = await params;

  const caseStudy: CaseStudyWithRelations = await prisma.caseStudy.findUniqueOrThrow({
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
          exercises: {
            create: caseStudyModule.exercises.map((exercise) => ({
              title: exercise.title,
              shortDescription: exercise.shortDescription,
              details: exercise.details,
              orderNumber: exercise.orderNumber,
              createdBy: adminEmail,
              updatedBy: adminEmail,
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
    // First, delete all exercise attempts for exercises in this case study's modules
    await tx.exerciseAttempt.deleteMany({
      where: {
        exercise: {
          module: {
            caseStudyId: id,
          },
        },
      },
    });

    // Then delete all exercises in this case study's modules
    await tx.moduleExercise.deleteMany({
      where: {
        module: {
          caseStudyId: id,
        },
      },
    });

    // Delete all modules for this case study
    await tx.caseStudyModule.deleteMany({
      where: { caseStudyId: id },
    });

    // Delete all enrollment students for enrollments of this case study
    await tx.enrollmentStudent.deleteMany({
      where: {
        enrollment: {
          caseStudyId: id,
        },
      },
    });

    // Delete all enrollments for this case study
    await tx.classCaseStudyEnrollment.deleteMany({
      where: { caseStudyId: id },
    });

    // Delete all final submissions for this case study
    await tx.finalSubmission.deleteMany({
      where: { caseStudyId: id },
    });

    // Finally, delete the case study itself
    await tx.caseStudy.delete({
      where: { id },
    });
  });

  return { message: 'Case study deleted successfully' };
}

export const GET = withErrorHandlingV2<CaseStudyWithRelations>(getHandler);
export const PUT = withErrorHandlingV2<CaseStudyWithRelations>(putHandler);
export const DELETE = withErrorHandlingV2<DeleteResponse>(deleteHandler);
