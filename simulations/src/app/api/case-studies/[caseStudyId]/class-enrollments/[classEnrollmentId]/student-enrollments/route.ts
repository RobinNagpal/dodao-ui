import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { verifyEnrollmentAccess } from '@/app/api/helpers/enrollments-util';
import { ClassEnrollmentResponse } from '@/types/api';
import { AddStudentEnrollmentRequest } from '@/components/instructor/InstructorManageStudentsModal';
import { getOrCreateUser } from '@/utils/user-utils';
import { UserRole } from '@prisma/client';

interface SimpleResponse {
  students: Array<{
    email: string;
    studentEnrollmentId: string;
  }>;
}

// GET /api/case-studies/[caseStudyId]/class-enrollments/[classEnrollmentId]/student-enrollments - Get students data for table view or simple list
async function getHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string; classEnrollmentId: string }> }
): Promise<ClassEnrollmentResponse | SimpleResponse> {
  const { caseStudyId, classEnrollmentId } = await params;
  const url = new URL(req.url);
  const studentDetails = url.searchParams.get('student-details');

  // Verify user has access to this enrollment
  const enrollment = await verifyEnrollmentAccess({
    userContext,
    classEnrollmentId,
    caseStudyId,
  });

  const simpleEnrollment = await prisma.classCaseStudyEnrollment.findFirstOrThrow({
    where: { id: enrollment.id },
    include: {
      students: {
        where: { archive: false },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  // If student-details is not requested, return simple email list with studentEnrollmentId
  if (studentDetails !== 'true') {
    const studentIds = simpleEnrollment.students.map((student) => student.assignedStudentId);

    if (studentIds.length === 0) {
      return { students: [] };
    }

    // Fetch the user emails using the student IDs
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: studentIds,
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    const students = simpleEnrollment.students
      .map((enrollmentStudent) => {
        const user = users.find((u) => u.id === enrollmentStudent.assignedStudentId);
        return {
          email: user?.email || '',
          studentEnrollmentId: enrollmentStudent.id,
        };
      })
      .filter((student) => student.email !== '');

    return { students };
  }

  // If student-details=true, return student data with attempts and final summaries (no case study structure)
  const detailedEnrollment = await prisma.classCaseStudyEnrollment.findFirst({
    where: { id: enrollment.id },
    include: {
      students: {
        where: { archive: false },
        orderBy: { createdAt: 'asc' },
        include: {
          assignedStudent: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!detailedEnrollment) {
    throw new Error('Class enrollment not found or you do not have access to it');
  }

  // Get all exercise IDs for this case study (we still need this to filter attempts)
  const caseStudyExercises = await prisma.moduleExercise.findMany({
    where: {
      module: {
        caseStudyId: caseStudyId,
        archive: false,
      },
      archive: false,
    },
    select: {
      id: true,
    },
  });

  const allExerciseIds = caseStudyExercises.map((e) => e.id);

  // Build student data using Prisma types
  const studentsData = await Promise.all(
    detailedEnrollment.students.map(async (student) => {
      // Get all exercise attempts for this student
      const attempts = await prisma.exerciseAttempt.findMany({
        where: {
          exerciseId: { in: allExerciseIds },
          createdById: student.assignedStudentId,
          archive: false,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Get final summary for this student
      const finalSummary = await prisma.finalSummary.findFirst({
        where: {
          studentId: student.id,
          archive: false,
        },
      });

      return {
        ...student,
        attempts,
        finalSummary,
      };
    })
  );

  return {
    students: studentsData.sort((a, b) => a.assignedStudentId.localeCompare(b.assignedStudentId)),
  };
}

// POST /api/case-studies/[caseStudyId]/class-enrollments/[classEnrollmentId]/student-enrollments - Add a student to specific class enrollment
async function postHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ caseStudyId: string; classEnrollmentId: string }> }
): Promise<{ message: string }> {
  const { caseStudyId, classEnrollmentId } = await params;
  const body = (await req.json()) as AddStudentEnrollmentRequest;
  const { studentEmail } = body;

  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  // Verify user has access to this enrollment
  const enrollment = await verifyEnrollmentAccess({
    userContext,
    classEnrollmentId,
    caseStudyId,
  });

  // Check if the student user exists, create if not
  const currentStudent = await getOrCreateUser(studentEmail, UserRole.Student);

  // Check if student is already enrolled
  const existingEnrollment = await prisma.enrollmentStudent.findFirst({
    where: {
      enrollmentId: enrollment.id,
      assignedStudentId: currentStudent.id,
      archive: false,
    },
  });

  if (existingEnrollment) {
    throw new Error('Student is already enrolled in this class');
  }

  // Add the student
  await prisma.enrollmentStudent.create({
    data: {
      enrollmentId: enrollment.id,
      assignedStudentId: currentStudent.id,
      createdById: userContext.userId,
      updatedById: userContext.userId,
      archive: false,
    },
  });

  return { message: 'Student successfully added to the class enrollment' };
}

export const GET = withLoggedInUser<ClassEnrollmentResponse | SimpleResponse>(getHandler);
export const POST = withLoggedInUser<{ message: string }>(postHandler);
