import { prisma } from '@/prisma';
import { CaseStudyWithInstructorAndStudents, CaseStudyWithRelationsForAdmin, CaseStudyWithRelationsForStudents } from '@/types/api';
import type { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { CaseStudy, User } from '@prisma/client';

/**
 * Get all case studies for admin
 * @returns Promise<CaseStudyWithRelations[]> Array of case studies with their relations
 */
export async function getAdminCaseStudies(): Promise<CaseStudyWithRelationsForAdmin[]> {
  const caseStudies: CaseStudyWithRelationsForAdmin[] = await prisma.caseStudy.findMany({
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
      createdBy: true,
      updatedBy: true,
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
export async function getAdminCaseStudy(caseStudyId: string): Promise<CaseStudyWithRelationsForStudents> {
  const caseStudy = await prisma.caseStudy.findFirstOrThrow({
    where: {
      id: caseStudyId,
      archive: false,
    },
    include: {
      createdBy: true,
      updatedBy: true,
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
  return caseStudies as CaseStudyWithRelationsForStudents[];
}

/**
 * Get a specific case study for instructor
 * @param caseStudyId The ID of the case study to retrieve
 * @param instructorId The email of the instructor
 * @returns Promise<CaseStudyWithRelations> The case study with its relations
 */
export async function getInstructorCaseStudy(caseStudyId: string, instructorId: string): Promise<CaseStudyWithRelationsForStudents> {
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

  return caseStudy as CaseStudyWithRelationsForStudents;
}

/**
 * Get enrolled case studies for a student
 * @param userId The id of the student
 * @returns Promise<CaseStudyWithRelations[]> Array of case studies the student is enrolled in
 */
export async function getStudentCaseStudies(userId: string): Promise<CaseStudyWithRelationsForStudents[]> {
  // Find all enrollments where this student is enrolled
  const enrollments = await prisma.classCaseStudyEnrollment.findMany({
    where: {
      archive: false,
      students: {
        some: {
          assignedStudentId: userId,
          archive: false,
        },
      },
    },
    include: {
      caseStudy: {
        include: {
          createdBy: true,
          updatedBy: true,
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

  // Get instructor information for each enrollment
  const enrolledCaseStudies: CaseStudyWithRelationsForStudents[] = await Promise.all(
    enrollments.map(async (enrollment): Promise<CaseStudyWithRelationsForStudents> => {
      const instructorId: string = enrollment.assignedInstructorId;

      // Fetch instructor user information
      const instructor: { id: string; name: string | null; email: string | null } | null = await prisma.user.findFirst({
        where: {
          id: instructorId,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      const caseStudyWithInstructor: CaseStudyWithRelationsForStudents = {
        ...enrollment.caseStudy,
        instructorEmail: instructor?.email || undefined,
        instructorName: instructor?.name,
      };

      return caseStudyWithInstructor;
    })
  );

  return enrolledCaseStudies;
}

/**
 * Get a specific case study for student
 * @param caseStudyId The ID of the case study to retrieve
 * @param studentId The email of the student
 * @returns Promise<CaseStudyWithRelations> The case study with its relations
 */
export async function getStudentCaseStudy(caseStudyId: string, studentId: string): Promise<CaseStudyWithRelationsForStudents> {
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
          createdBy: true,
          updatedBy: true,
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
                      createdById: studentId,
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

  // Fetch instructor information
  const instructorId: string = enrollment.assignedInstructorId;
  const instructor: { id: string; name: string | null; email: string | null } | null = await prisma.user.findFirst({
    where: {
      id: instructorId,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  // Add instruction read status and instructor information to the response
  const caseStudyWithStatus: CaseStudyWithRelationsForStudents = {
    ...enrollment.caseStudy,
    instructorEmail: instructorId,
    instructorName: instructor?.name || null,
    instructionReadStatus: instructionReadStatus || undefined,
  };

  return caseStudyWithStatus;
}

export async function checkCanEditCaseStudy(
  userContext: DoDaoJwtTokenPayload,
  caseStudyId: string
): Promise<{
  caseStudy: CaseStudy;
  user: User;
}> {
  const caseStudy: CaseStudy = await prisma.caseStudy.findUniqueOrThrow({
    where: {
      id: caseStudyId,
    },
  });

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userContext.userId,
    },
  });

  if (user.role === 'Admin') {
    return { caseStudy, user };
  }

  if (caseStudy.editors.includes(user.id)) {
    return { caseStudy, user };
  }

  throw new Error('User does not have permission to update this case study');
}

export async function checkCanAccessCaseStudy(
  userContext: DoDaoJwtTokenPayload,
  caseStudyId: string
): Promise<{
  caseStudy: CaseStudyWithInstructorAndStudents;
  user: User;
}> {
  const caseStudy: CaseStudyWithInstructorAndStudents = await prisma.caseStudy.findUniqueOrThrow({
    where: {
      id: caseStudyId,
    },
    include: {
      enrollments: {
        include: {
          students: {
            where: {
              archive: false,
            },
          },
        },
      },
    },
  });

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userContext.userId,
    },
  });

  if (user.role === 'Admin') {
    return { caseStudy, user };
  }

  if (caseStudy.editors.includes(user.id)) {
    return { caseStudy, user };
  }

  const allowedCases = caseStudy.enrollments.some((e) => {
    return e.assignedInstructorId === user.id || e.students.some((s) => s.assignedStudentId === user.id);
  });

  if (allowedCases) {
    return { caseStudy, user };
  }

  throw new Error('User does not have permission to update this case study');
}
