import { prisma } from '@/prisma';
import { getOrCreateUser } from '@/utils/user-utils';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { EnrollmentStudent, UserRole } from '@prisma/client';
import { KoalaGainsSpaceId } from 'insights-ui/src/types/koalaGainsConstants';
import { NextRequest } from 'next/server';

interface AddStudentRequest {
  studentEmail: string;
}

// POST /api/enrollments/[id]/students - Add a student to an enrollment
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: Promise<{ id: string }> }): Promise<EnrollmentStudent> {
  const { id: enrollmentId } = await params;
  const body: AddStudentRequest = await req.json();
  const studentEmail = body.studentEmail;
  const currentStudent = await getOrCreateUser(studentEmail, UserRole.Student);

  // Check if student is already enrolled
  const existingStudent: EnrollmentStudent | null = await prisma.enrollmentStudent.findFirst({
    where: {
      enrollmentId,
      assignedStudentId: currentStudent.id,
      archive: false,
    },
  });

  if (existingStudent) {
    throw new Error('Student is already enrolled in this case study');
  }

  const student: EnrollmentStudent = await prisma.enrollmentStudent.create({
    data: {
      enrollmentId,
      assignedStudentId: currentStudent.id, // Student email
      createdById: userContext.userId,
      updatedById: userContext.userId,
      archive: false,
    },
  });

  return student;
}

export const POST = withLoggedInUser<EnrollmentStudent>(postHandler);
