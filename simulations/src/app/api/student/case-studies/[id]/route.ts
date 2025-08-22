import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { CaseStudyWithRelations } from '@/types/api';

interface UpdateInstructionStatusRequest {
  studentEmail: string;
  type: 'case_study' | 'module';
  moduleId?: string;
}

// GET /api/student/case-studies/[id] - Get case study details for a student
async function getHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<CaseStudyWithRelations> {
  const { id } = await params;
  const url = new URL(req.url);
  const studentEmail = url.searchParams.get('studentEmail');

  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  // Check if student is enrolled in this case study and get their enrollment record
  const enrollment = await prisma.classCaseStudyEnrollment.findFirst({
    where: {
      caseStudyId: id,
      archive: false,
      students: {
        some: {
          assignedStudentId: studentEmail,
          archive: false,
        },
      },
    },
    include: {
      students: {
        where: {
          assignedStudentId: studentEmail,
          archive: false,
        },
      },
      caseStudy: {
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
                include: {
                  attempts: {
                    where: {
                      createdBy: studentEmail,
                      archive: false,
                    },
                    orderBy: {
                      createdAt: 'desc',
                    },
                  },
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
      },
    },
  });

  if (!enrollment || !enrollment.students || enrollment.students.length === 0) {
    throw new Error('Student is not enrolled in this case study or case study does not exist');
  }

  // Get the student's instruction read status
  const studentRecord = enrollment.students[0];
  const instructionReadStatus = studentRecord.instructionReadStatus as {
    readCaseInstructions: boolean;
    moduleInstructions: Array<{
      id: string;
      readModuleInstructions: boolean;
    }>;
  } | null;

  // Add instruction read status to the response
  const caseStudyWithStatus: CaseStudyWithRelations = {
    ...enrollment.caseStudy,
    instructionReadStatus: instructionReadStatus || undefined,
  };

  return caseStudyWithStatus;
}

// PUT /api/student/case-studies/[id] - Update instruction read status
async function putHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<{ success: boolean; message: string }> {
  const { id } = await params;
  const body: UpdateInstructionStatusRequest = await req.json();
  const { studentEmail, type, moduleId } = body;

  if (!studentEmail) {
    throw new Error('Student email is required');
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
      caseStudyId: id,
      archive: false,
      students: {
        some: {
          assignedStudentId: studentEmail,
          archive: false,
        },
      },
    },
    include: {
      students: {
        where: {
          assignedStudentId: studentEmail,
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

export const GET = withErrorHandlingV2<CaseStudyWithRelations>(getHandler);
export const PUT = withErrorHandlingV2<{ success: boolean; message: string }>(putHandler);
