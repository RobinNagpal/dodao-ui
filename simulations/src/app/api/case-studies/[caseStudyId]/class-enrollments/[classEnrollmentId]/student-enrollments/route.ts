import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { verifyEnrollmentAccess } from '@/app/api/helpers/enrollments-util';
import { ClassEnrollmentResponse } from '@/types/api';
import { AddStudentEnrollmentRequest } from '@/components/instructor/case-study-tabs/ManageStudentsTab';
import { getOrCreateUser } from '@/utils/user-utils';
import { UserRole } from '@prisma/client';
import { withLoggedInUserAndActivityLog } from '@/middleware/withActivityLogging';

interface SimpleResponse {
  students: Array<{
    email: string;
    name?: string | null;
    studentEnrollmentId: string;
    userId: string;
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
        name: true,
      },
    });

    const students = simpleEnrollment.students
      .map((enrollmentStudent) => {
        const user = users.find((u) => u.id === enrollmentStudent.assignedStudentId);
        return {
          email: user?.email || '',
          name: user?.name || '',
          studentEnrollmentId: enrollmentStudent.id,
          userId: enrollmentStudent.assignedStudentId,
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
    className: detailedEnrollment.className,
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
  const { studentEmail, studentName, students } = body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Verify user has access to this enrollment
  const enrollment = await verifyEnrollmentAccess({
    userContext,
    classEnrollmentId,
    caseStudyId,
  });

  const addStudentToEnrollment = async (email: string, name?: string, throwOnDuplicate = true): Promise<{ status: 'added' | 'duplicate' }> => {
    const currentStudent = await getOrCreateUser(email, UserRole.Student, name);

    const existingEnrollment = await prisma.enrollmentStudent.findFirst({
      where: {
        enrollmentId: enrollment.id,
        assignedStudentId: currentStudent.id,
        archive: false,
      },
    });

    if (existingEnrollment) {
      if (throwOnDuplicate) {
        throw new Error('Student is already enrolled in this class');
      }
      return { status: 'duplicate' };
    }

    await prisma.enrollmentStudent.create({
      data: {
        enrollmentId: enrollment.id,
        assignedStudentId: currentStudent.id,
        createdById: userContext.userId,
        updatedById: userContext.userId,
        archive: false,
      },
    });

    return { status: 'added' };
  };

  // Bulk add flow
  if (Array.isArray(students) && students.length > 0) {
    let added = 0;
    let duplicates = 0;
    const invalid: string[] = [];

    for (let i = 0; i < students.length; i++) {
      const entry = students[i];
      const email = entry?.email?.trim();
      const name = entry?.name?.trim();

      if (!email || !emailRegex.test(email)) {
        invalid.push(`Row ${i + 1}: invalid or missing email`);
        continue;
      }

      const result = await addStudentToEnrollment(email, name, false);
      if (result.status === 'added') added += 1;
      if (result.status === 'duplicate') duplicates += 1;
    }

    const parts = [`Added ${added} student${added === 1 ? '' : 's'}`];
    if (duplicates > 0) parts.push(`skipped ${duplicates} duplicate${duplicates === 1 ? '' : 's'}`);
    if (invalid.length > 0) parts.push(`${invalid.length} invalid row${invalid.length === 1 ? '' : 's'}`);

    return { message: parts.join('; ') || 'No students processed' };
  }

  // Single add flow
  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  if (!emailRegex.test(studentEmail)) {
    throw new Error('Invalid student email');
  }

  await addStudentToEnrollment(studentEmail, studentName);

  return { message: 'Student successfully added to the class enrollment' };
}

export const GET = withLoggedInUser<ClassEnrollmentResponse | SimpleResponse>(getHandler);
export const POST = withLoggedInUserAndActivityLog<{ message: string }>(postHandler);
