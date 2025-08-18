import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { EnrollmentStudent } from '@prisma/client';

interface AddStudentRequest {
  studentEmail: string;
}

// POST /api/enrollments/[id]/students - Add a student to an enrollment
async function postHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<EnrollmentStudent> {
  const { id: enrollmentId } = await params;
  const body: AddStudentRequest = await req.json();

  // Get admin email from request headers
  const adminEmail: string = req.headers.get('admin-email') || 'admin@example.com';

  // Check if student is already enrolled
  const existingStudent: EnrollmentStudent | null = await prisma.enrollmentStudent.findFirst({
    where: {
      enrollmentId,
      assignedStudentId: body.studentEmail,
    },
  });

  if (existingStudent) {
    throw new Error('Student is already enrolled in this case study');
  }

  const student: EnrollmentStudent = await prisma.enrollmentStudent.create({
    data: {
      enrollmentId,
      assignedStudentId: body.studentEmail, // Student email
      createdBy: adminEmail, // Admin email
      updatedBy: adminEmail, // Admin email
    },
  });

  return student;
}

export const POST = withErrorHandlingV2<EnrollmentStudent>(postHandler);
