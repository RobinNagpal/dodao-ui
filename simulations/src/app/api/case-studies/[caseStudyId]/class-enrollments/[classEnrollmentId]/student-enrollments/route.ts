import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { verifyEnrollmentAccess } from '@/app/api/helpers/enrollments-util';
import type { AttemptDetail, ExerciseProgress, StudentTableData, ModuleTableData } from '@/types';
import { AddStudentEnrollmentRequest } from '@/components/instructor/InstructorManageStudentsModal';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { prismaAdapter } from '@/app/api/auth/[...nextauth]/authOptions';

interface TableResponse {
  students: StudentTableData[];
  modules: ModuleTableData[];
}

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
): Promise<TableResponse | SimpleResponse> {
  const { caseStudyId, classEnrollmentId } = await params;
  const url = new URL(req.url);
  const studentDetails = url.searchParams.get('student-details');

  // Verify user has access to this enrollment
  const enrollment = await verifyEnrollmentAccess({
    userContext,
    classEnrollmentId,
    caseStudyId,
  });

  const enrollmentWithStudents = await prisma.classCaseStudyEnrollment.findFirstOrThrow({
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
    const studentIds = enrollmentWithStudents.students.map((student) => student.assignedStudentId);

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

    const students = enrollmentWithStudents.students
      .map((enrollmentStudent: any) => {
        const user = users.find((u) => u.id === enrollmentStudent.assignedStudentId);
        return {
          email: user?.email || '',
          studentEnrollmentId: enrollmentStudent.id,
        };
      })
      .filter((student: any) => student.email !== '');

    return { students };
  }

  // If student-details=true, return detailed table data
  const detailedEnrollment = await prisma.classCaseStudyEnrollment.findFirst({
    where: { id: enrollment.id },
    include: {
      caseStudy: {
        include: {
          modules: {
            where: { archive: false },
            orderBy: { orderNumber: 'asc' },
            include: {
              exercises: {
                where: { archive: false },
                orderBy: { orderNumber: 'asc' },
              },
            },
          },
        },
      },
      students: {
        where: { archive: false },
        orderBy: { createdAt: 'asc' },
        include: {
          assignedStudent: {
            select: { email: true },
          },
        },
      },
    },
  });

  if (!detailedEnrollment) {
    throw new Error('Class enrollment not found or you do not have access to it');
  }

  // Get all exercise IDs for this case study
  const allExerciseIds = detailedEnrollment.caseStudy.modules.flatMap((module) => module.exercises.map((exercise) => exercise.id));

  // For each student in this enrollment, get their exercise attempts
  const studentsTableData: StudentTableData[] = [];

  for (const student of detailedEnrollment.students) {
    // Get all exercise attempts for this student
    const exerciseAttempts = await prisma.exerciseAttempt.findMany({
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

    // Group attempts by exercise ID
    const attemptsByExercise = exerciseAttempts.reduce((acc, attempt) => {
      if (!acc[attempt.exerciseId]) {
        acc[attempt.exerciseId] = [];
      }
      acc[attempt.exerciseId].push({
        id: attempt.id,
        attemptNumber: attempt.attemptNumber,
        status: attempt.status,
        evaluatedScore: attempt.evaluatedScore,
        createdAt: attempt.createdAt.toISOString(),
      });
      return acc;
    }, {} as Record<string, AttemptDetail[]>);

    // Build exercise progress data
    const exercises: ExerciseProgress[] = detailedEnrollment.caseStudy.modules.flatMap((module) =>
      module.exercises.map((exercise) => ({
        exerciseId: exercise.id,
        moduleId: module.id,
        moduleOrderNumber: module.orderNumber,
        exerciseOrderNumber: exercise.orderNumber,
        hasAttempts: !!attemptsByExercise[exercise.id]?.length,
        attempts: attemptsByExercise[exercise.id] || [],
      }))
    );

    studentsTableData.push({
      id: student.id,
      assignedStudentId: student.assignedStudentId,
      email: student.assignedStudent.email || 'Unknown',
      enrollmentId: student.enrollmentId,
      exercises,
      finalSummary: finalSummary
        ? {
            id: finalSummary.id,
            status: finalSummary.status,
            hasContent: !!finalSummary.response,
            response: finalSummary.response,
            createdAt: finalSummary.createdAt.toISOString(),
          }
        : undefined,
      createdAt: student.createdAt.toISOString(),
    });
  }

  // Prepare modules data for table headers
  const modules = detailedEnrollment.caseStudy.modules.map((module) => ({
    id: module.id,
    orderNumber: module.orderNumber,
    title: module.title,
    exercises: module.exercises.map((exercise) => ({
      id: exercise.id,
      orderNumber: exercise.orderNumber,
      title: exercise.title,
    })),
  }));

  return {
    students: studentsTableData.sort((a, b) => a.assignedStudentId.localeCompare(b.assignedStudentId)),
    modules,
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
  const instructorId: string = userContext.userId;

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
  let student = await prisma.user.findFirst({
    where: {
      email: studentEmail,
    },
  });

  if (!student) {
    student = await prismaAdapter.createUser({
      email: studentEmail,
      spaceId: KoalaGainsSpaceId,
      username: studentEmail,
      authProvider: 'custom-email',
      role: 'Student',
    });
    if (!student) throw new Error(`Failed to create student ${studentEmail} in Koala Gains. Please contact the Koala Gains team.`);
  }

  // Check if student is already enrolled
  try {
    await prisma.enrollmentStudent.findFirstOrThrow({
      where: {
        enrollmentId: enrollment.id,
        assignedStudentId: student.id,
        archive: false,
      },
    });

    throw new Error('Student is already enrolled in this class');
  } catch (error) {
    // If the student is not found, we can proceed with enrollment
    if ((error as Error).message.includes('No')) {
      // Add the student
      await prisma.enrollmentStudent.create({
        data: {
          enrollmentId: enrollment.id,
          assignedStudentId: student.id,
          createdById: instructorId,
          updatedById: instructorId,
        },
      });

      return { message: 'Student added successfully' };
    }

    // Re-throw any other errors
    throw error;
  }
}

export const GET = withLoggedInUser<TableResponse | SimpleResponse>(getHandler);
export const POST = withLoggedInUser<{ message: string }>(postHandler);
