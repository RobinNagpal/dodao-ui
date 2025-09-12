import { prisma } from '@/prisma';
import { CaseStudy } from '@/types';
import { CaseStudyWithRelations } from '@/types/api';

/**
 * Get all case studies for admin
 * @returns Promise<CaseStudyWithRelations[]> Array of case studies with their relations
 */
export async function getAdminCaseStudies(): Promise<CaseStudyWithRelations[]> {
  const caseStudies: CaseStudyWithRelations[] = await prisma.caseStudy.findMany({
    where: {
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  return caseStudies;
}

/**
 * Get a specific case study for admin
 * @param caseStudyId The ID of the case study to retrieve
 * @returns Promise<CaseStudyWithRelations> The case study with its relations
 */
export async function getAdminCaseStudy(caseStudyId: string): Promise<CaseStudyWithRelations> {
  const caseStudy = await prisma.caseStudy.findFirstOrThrow({
    where: {
      id: caseStudyId,
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

/**
 * Get case studies assigned to an instructor
 * @param instructorId The email of the instructor
 * @returns Promise<CaseStudy[]> Array of case studies assigned to the instructor
 */
export async function getInstructorCaseStudies(instructorId: string): Promise<CaseStudy[]> {
  // Find case studies that have enrollments assigned to this instructor
  const caseStudies = await prisma.caseStudy.findMany({
    where: {
      archive: false,
      enrollments: {
        some: {
          assignedInstructorId: instructorId,
          archive: false,
        },
      },
    },
    include: {
      modules: {
        where: {
          archive: false,
        },
        orderBy: {
          orderNumber: 'asc',
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
      },
      enrollments: {
        where: {
          assignedInstructorId: instructorId,
          archive: false,
        },
        include: {
          students: {
            where: {
              archive: false,
            },
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              finalSubmission: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Convert Prisma types to our frontend types
  return caseStudies as CaseStudyWithRelations[];
}

/**
 * Get a specific case study for instructor
 * @param caseStudyId The ID of the case study to retrieve
 * @param instructorId The email of the instructor
 * @returns Promise<CaseStudyWithRelations> The case study with its relations
 */
export async function getInstructorCaseStudy(caseStudyId: string, instructorId: string): Promise<CaseStudyWithRelations> {
  // Find the case study and verify instructor has access
  const caseStudy = await prisma.caseStudy.findFirst({
    where: {
      id: caseStudyId,
      archive: false,
      enrollments: {
        some: {
          assignedInstructorId: instructorId,
          archive: false,
        },
      },
    },
    include: {
      modules: {
        where: {
          archive: false,
        },
        orderBy: {
          orderNumber: 'asc',
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
      },
      enrollments: {
        where: {
          assignedInstructorId: instructorId,
          archive: false,
        },
        include: {
          students: {
            where: {
              archive: false,
            },
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              finalSubmission: {},
            },
          },
        },
      },
    },
  });

  if (!caseStudy) {
    throw new Error('Case study not found or you do not have access to it');
  }

  return caseStudy as CaseStudyWithRelations;
}

/**
 * Get enrolled case studies for a student
 * @param studentEmail The email of the student
 * @returns Promise<CaseStudyWithRelations[]> Array of case studies the student is enrolled in
 */
export async function getStudentCaseStudies(studentEmail: string): Promise<CaseStudyWithRelations[]> {
  // Find all enrollments where this student is enrolled
  const enrollments = await prisma.classCaseStudyEnrollment.findMany({
    where: {
      archive: false,
      students: {
        some: {
          assignedStudentId: studentEmail,
          archive: false,
        },
      },
    },
    include: {
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

  // Extract case studies from enrollments and include instructor email
  const enrolledCaseStudies: CaseStudyWithRelations[] = enrollments.map((enrollment) => ({
    ...enrollment.caseStudy,
    instructorEmail: enrollment.assignedInstructorId,
  }));

  return enrolledCaseStudies;
}

/**
 * Get a specific case study for student
 * @param caseStudyId The ID of the case study to retrieve
 * @param studentId The email of the student
 * @returns Promise<CaseStudyWithRelations> The case study with its relations
 */
export async function getStudentCaseStudy(caseStudyId: string, studentId: string): Promise<CaseStudyWithRelations> {
  // Check if student is enrolled in this case study and get their enrollment record
  const enrollment = await prisma.classCaseStudyEnrollment.findFirst({
    where: {
      caseStudyId,
      archive: false,
      students: {
        some: {
          assignedStudentId: studentId,
          archive: false,
        },
      },
    },
    include: {
      students: {
        where: {
          assignedStudentId: studentId,
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
                      createdBy: studentId,
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
