import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// GET /api/instructor/enrollments/[caseStudyId]/students?instructorEmail=xxx - Get students enrolled in a case study for an instructor
async function getHandler(req: NextRequest, { params }: { params: Promise<{ caseStudyId: string }> }): Promise<string[]> {
  const { caseStudyId } = await params;
  const { searchParams } = new URL(req.url);
  const instructorEmail = searchParams.get('instructorEmail');

  if (!instructorEmail) {
    throw new Error('Instructor email is required');
  }

  // Find the enrollment for this case study assigned to this instructor
  const enrollment = await prisma.classCaseStudyEnrollment.findFirst({
    where: {
      caseStudyId,
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
      },
    },
  });

  if (!enrollment) {
    return [];
  }

  return enrollment.students.map((student) => student.assignedStudentId);
}

// POST /api/instructor/enrollments/[caseStudyId]/students - Add a student to enrollment
async function postHandler(req: NextRequest, { params }: { params: Promise<{ caseStudyId: string }> }): Promise<{ message: string }> {
  const { caseStudyId } = await params;
  const body = await req.json();
  const { studentEmail, instructorEmail } = body;

  if (!studentEmail || !instructorEmail) {
    throw new Error('Student email and instructor email are required');
  }

  // Find the enrollment for this case study assigned to this instructor
  const enrollment = await prisma.classCaseStudyEnrollment.findFirst({
    where: {
      caseStudyId,
      assignedInstructorId: instructorEmail,
      archive: false,
    },
  });

  if (!enrollment) {
    throw new Error('Enrollment not found or you are not assigned to this case study');
  }

  // Check if student is already enrolled
  const existingStudent = await prisma.enrollmentStudent.findFirst({
    where: {
      enrollmentId: enrollment.id,
      assignedStudentId: studentEmail,
      archive: false,
    },
  });

  if (existingStudent) {
    throw new Error('Student is already enrolled in this case study');
  }

  // Add the student
  await prisma.enrollmentStudent.create({
    data: {
      enrollmentId: enrollment.id,
      assignedStudentId: studentEmail,
      createdBy: instructorEmail,
      updatedBy: instructorEmail,
    },
  });

  return { message: 'Student added successfully' };
}

// here we can also archive the exercise attempts and final submission also for this student
// DELETE /api/instructor/enrollments/[caseStudyId]/students - Remove a student from enrollment
async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ caseStudyId: string }> }): Promise<{ message: string }> {
  const { caseStudyId } = await params;
  const body = await req.json();
  const { studentEmail, instructorEmail } = body;

  if (!studentEmail || !instructorEmail) {
    throw new Error('Student email and instructor email are required');
  }

  // Find the enrollment for this case study assigned to this instructor
  const enrollment = await prisma.classCaseStudyEnrollment.findFirst({
    where: {
      caseStudyId,
      assignedInstructorId: instructorEmail,
      archive: false,
    },
  });

  if (!enrollment) {
    throw new Error('Enrollment not found or you are not assigned to this case study');
  }

  // Archive the student
  const deletedStudent = await prisma.enrollmentStudent.updateMany({
    where: {
      enrollmentId: enrollment.id,
      assignedStudentId: studentEmail,
      archive: false,
    },
    data: {
      archive: true,
    },
  });

  if (deletedStudent.count === 0) {
    throw new Error('Student not found in this enrollment');
  }

  return { message: 'Student removed successfully' };
}

export const GET = withErrorHandlingV2(getHandler);
export const POST = withErrorHandlingV2(postHandler);
export const DELETE = withErrorHandlingV2(deleteHandler);
