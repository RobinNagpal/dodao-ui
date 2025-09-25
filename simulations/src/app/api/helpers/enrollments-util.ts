import { prisma } from '@/prisma';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { ClassCaseStudyEnrollment } from '@prisma/client';

interface VerifyEnrollmentAccessParams {
  userContext: DoDaoJwtTokenPayload;
  classEnrollmentId: string;
  caseStudyId: string;
}

export async function verifyEnrollmentAccess({ userContext, classEnrollmentId, caseStudyId }: VerifyEnrollmentAccessParams): Promise<ClassCaseStudyEnrollment> {
  // Verify user has access to this enrollment (either as assigned instructor or admin)
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userContext.userId },
  });

  const enrollment = await prisma.classCaseStudyEnrollment.findFirstOrThrow({
    where: {
      id: classEnrollmentId,
      caseStudyId,
      archive: false,
      ...(user.role === 'Admin' ? {} : { assignedInstructorId: userContext.userId }),
    },
  });

  return enrollment;
}
