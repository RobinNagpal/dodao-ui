import { getAdminCaseStudy, getInstructorCaseStudy, getStudentCaseStudy } from '@/app/api/helpers/case-studies-util';
import { prisma } from '@/prisma';
import {
  CaseStudyWithRelationsForAdmin,
  CaseStudyWithRelationsForInstructor,
  CaseStudyWithRelationsForStudents,
  DeleteResponse,
  UpdateCaseStudyRequest,
} from '@/types/api';
import { withErrorHandlingV2, withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';

// GET /api/case-studies/[id] - Get a specific case study for any user type
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string }> }
): Promise<CaseStudyWithRelationsForStudents | CaseStudyWithRelationsForInstructor | CaseStudyWithRelationsForAdmin> {
  const { caseStudyId } = await params;
  const { userId } = userContext;
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
  });

  // Handle different user types
  if (user.role === 'Student') {
    return await getStudentCaseStudy(caseStudyId, user.id);
  } else if (user.role === 'Instructor') {
    return await getInstructorCaseStudy(caseStudyId, user.id);
  } else if (user.role === 'Admin') {
    return await getAdminCaseStudy(caseStudyId);
  } else {
    throw new Error('Invalid user type');
  }
}

interface UpdateInstructionStatusRequest {
  type: 'case_study' | 'module';
  moduleId?: string;
}

// PUT /api/case-studies/[id] - Update a case study OR update instruction status
async function putHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ id: string }> }
): Promise<CaseStudyWithRelationsForStudents | CaseStudyWithRelationsForInstructor | CaseStudyWithRelationsForAdmin | { success: boolean; message: string }> {
  const { id } = await params;
  const body = await req.json();

  // Check if this is an instruction status update (for students)
  if ('type' in body) {
    return await updateInstructionStatus(id, body as UpdateInstructionStatusRequest, userContext);
  }

  // Otherwise, it's a case study update (for admins)
  return await updateCaseStudy(id, body as UpdateCaseStudyRequest, req, userContext);
}

// Update instruction read status for students
async function updateInstructionStatus(
  caseStudyId: string,
  body: UpdateInstructionStatusRequest,
  userContext: DoDaoJwtTokenPayload
): Promise<{ success: boolean; message: string }> {
  const { type, moduleId } = body;
  const { userId } = userContext;

  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!type || (type !== 'case_study' && type !== 'module')) {
    throw new Error('Type must be either "case_study" or "module"');
  }

  if (type === 'module' && !moduleId) {
    throw new Error('Module ID is required when type is "module"');
  }

  // Find the student's enrollment record
  const enrollment = await prisma.classCaseStudyEnrollment.findFirst({
    where: {
      caseStudyId,
      archive: false,
      students: {
        some: {
          assignedStudentId: userId,
          archive: false,
        },
      },
    },
    include: {
      students: {
        where: {
          assignedStudentId: userId,
          archive: false,
        },
      },
    },
  });

  if (!enrollment || !enrollment.students || enrollment.students.length === 0) {
    throw new Error('Student is not enrolled in this case study or case study does not exist');
  }

  const studentRecord = enrollment.students[0];

  // Get current instruction read status or create new one
  let currentStatus = (studentRecord.instructionReadStatus as {
    readCaseInstructions: boolean;
    moduleInstructions: Array<{
      id: string;
      readModuleInstructions: boolean;
    }>;
  } | null) || {
    readCaseInstructions: false,
    moduleInstructions: [],
  };

  if (type === 'case_study') {
    currentStatus.readCaseInstructions = true;
  } else if (type === 'module' && moduleId) {
    // Find existing module instruction status or create new one
    const existingModuleIndex = currentStatus.moduleInstructions.findIndex((module) => module.id === moduleId);

    if (existingModuleIndex >= 0) {
      currentStatus.moduleInstructions[existingModuleIndex].readModuleInstructions = true;
    } else {
      currentStatus.moduleInstructions.push({
        id: moduleId,
        readModuleInstructions: true,
      });
    }
  }

  // Update the student record with new status
  await prisma.enrollmentStudent.update({
    where: {
      id: studentRecord.id,
    },
    data: {
      instructionReadStatus: currentStatus,
    },
  });

  return {
    success: true,
    message: type === 'case_study' ? 'Case study instructions marked as read' : 'Module instructions marked as read',
  };
}

// Update case study (for admins)
async function updateCaseStudy(
  id: string,
  body: UpdateCaseStudyRequest,
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload
): Promise<CaseStudyWithRelationsForStudents | CaseStudyWithRelationsForInstructor | CaseStudyWithRelationsForAdmin> {
  // Get admin email from request headers
  const adminEmail: string = req.headers.get('admin-email') || 'admin@example.com';

  // Update case study with modules and exercises using transaction
  const caseStudy: CaseStudyWithRelationsForStudents = await prisma.$transaction(async (tx) => {
    // Update the case study basic info
    await tx.caseStudy.update({
      where: { id },
      data: {
        title: body.title,
        shortDescription: body.shortDescription,
        details: body.details,
        finalSummaryPromptInstructions: body.finalSummaryPromptInstructions,
        subject: body.subject,
        updatedById: userContext.userId,
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
            updatedById: userContext.userId,
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
            createdById: userContext.userId,
            updatedById: userContext.userId,
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
              updatedById: userContext.userId,
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
              createdById: userContext.userId,
              updatedById: userContext.userId,
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
        updatedBy: true,
        createdBy: true,
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
async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ caseStudyId: string }> }): Promise<DeleteResponse> {
  const { caseStudyId } = await params;

  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // First, archive all exercise attempts for exercises in this case study's modules
    await tx.exerciseAttempt.updateMany({
      where: {
        exercise: {
          module: {
            caseStudyId: caseStudyId,
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
          caseStudyId: caseStudyId,
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
        caseStudyId: caseStudyId,
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
            caseStudyId: caseStudyId,
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
          caseStudyId: caseStudyId,
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
        caseStudyId: caseStudyId,
        archive: false,
      },
      data: {
        archive: true,
      },
    });

    // Finally, archive the case study itself
    await tx.caseStudy.update({
      where: { id: caseStudyId },
      data: {
        archive: true,
      },
    });
  });

  return { message: 'Case study deleted successfully' };
}

export const GET = withLoggedInUser<CaseStudyWithRelationsForStudents | CaseStudyWithRelationsForInstructor | CaseStudyWithRelationsForAdmin>(getHandler);
export const PUT = withLoggedInUser<
  CaseStudyWithRelationsForStudents | CaseStudyWithRelationsForInstructor | CaseStudyWithRelationsForAdmin | { success: boolean; message: string }
>(putHandler);
export const DELETE = withErrorHandlingV2<DeleteResponse>(deleteHandler);
