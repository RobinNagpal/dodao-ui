import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { CreateCaseStudyRequest, CaseStudyWithRelations } from '@/types/api';
import { isAdminEmail, isInstructorEmail, isStudentEmail } from '@/dummy/mockData';
import { CaseStudy } from '@/types';

// GET /api/case-studies - Get case studies based on user type
async function getHandler(req: NextRequest): Promise<CaseStudyWithRelations[] | CaseStudy[]> {
  const { searchParams } = new URL(req.url);
  const userEmail = searchParams.get('userEmail');
  const userType = searchParams.get('userType');

  if (!userEmail || !userType) {
    throw new Error('User email and user type are required');
  }

  // Verify user type matches email pattern for security
  if (userType === 'admin' && !isAdminEmail(userEmail)) {
    throw new Error('Invalid admin credentials');
  }
  if (userType === 'instructor' && !isInstructorEmail(userEmail)) {
    throw new Error('Invalid instructor credentials');
  }
  if (userType === 'student' && !isStudentEmail(userEmail)) {
    throw new Error('Invalid student credentials');
  }

  switch (userType) {
    case 'admin':
      return await getAdminCaseStudies();
    case 'instructor':
      return await getInstructorCaseStudies(userEmail);
    case 'student':
      return await getStudentCaseStudies(userEmail);
    default:
      throw new Error('Invalid user type');
  }
}

// Get all case studies for admin
async function getAdminCaseStudies(): Promise<CaseStudyWithRelations[]> {
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

// Get case studies assigned to an instructor
async function getInstructorCaseStudies(instructorEmail: string): Promise<CaseStudy[]> {
  // Find case studies that have enrollments assigned to this instructor
  const caseStudies = await prisma.caseStudy.findMany({
    where: {
      archive: false,
      enrollments: {
        some: {
          assignedInstructorId: instructorEmail,
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
          assignedInstructorId: instructorEmail,
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
  const formattedCaseStudies: CaseStudy[] = caseStudies.map((cs) => ({
    ...cs,
    createdBy: cs.createdBy || undefined,
    updatedBy: cs.updatedBy || undefined,
    modules: cs.modules?.map((module) => ({
      ...module,
      createdBy: module.createdBy || undefined,
      updatedBy: module.updatedBy || undefined,
      exercises: module.exercises?.map((exercise) => ({
        ...exercise,
        createdBy: exercise.createdBy || undefined,
        updatedBy: exercise.updatedBy || undefined,
        promptHint: exercise.promptHint || undefined,
      })),
    })),
    enrollments: cs.enrollments?.map((enrollment) => ({
      ...enrollment,
      createdBy: enrollment.createdBy || undefined,
      updatedBy: enrollment.updatedBy || undefined,
      students: enrollment.students?.map((student) => ({
        ...student,
        createdBy: student.createdBy || undefined,
        updatedBy: student.updatedBy || undefined,
        finalSubmission: student.finalSubmission
          ? {
              ...student.finalSubmission,
              createdBy: student.finalSubmission.createdBy || undefined,
              updatedBy: student.finalSubmission.updatedBy || undefined,
              finalContent: student.finalSubmission.finalContent || undefined,
            }
          : undefined,
      })),
    })),
  }));

  return formattedCaseStudies;
}

// Get enrolled case studies for a student
async function getStudentCaseStudies(studentEmail: string): Promise<CaseStudyWithRelations[]> {
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

// POST /api/case-studies - Create a new case study
async function postHandler(req: NextRequest): Promise<CaseStudyWithRelations> {
  const body: CreateCaseStudyRequest = await req.json();

  // Get admin email from request headers or we could implement auth middleware
  // For now, using a placeholder - this should be replaced with actual auth
  const adminEmail: string = req.headers.get('admin-email') || 'admin@example.com';

  const caseStudy: CaseStudyWithRelations = await prisma.caseStudy.create({
    data: {
      title: body.title,
      shortDescription: body.shortDescription,
      details: body.details,
      finalSummaryPromptInstructions: body.finalSummaryPromptInstructions,
      subject: body.subject,
      createdBy: adminEmail,
      updatedBy: adminEmail,
      archive: false,
      modules: {
        create: body.modules.map((module) => ({
          title: module.title,
          shortDescription: module.shortDescription,
          details: module.details,
          orderNumber: module.orderNumber,
          createdBy: adminEmail,
          updatedBy: adminEmail,
          archive: false,
          exercises: {
            create: module.exercises.map((exercise) => ({
              title: exercise.title,
              shortDescription: exercise.shortDescription,
              details: exercise.details,
              promptHint: exercise.promptHint,
              orderNumber: exercise.orderNumber,
              createdBy: adminEmail,
              updatedBy: adminEmail,
              archive: false,
            })),
          },
        })),
      },
    },
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

export const GET = withErrorHandlingV2<CaseStudyWithRelations[] | CaseStudy[]>(getHandler);
export const POST = withErrorHandlingV2<CaseStudyWithRelations>(postHandler);
