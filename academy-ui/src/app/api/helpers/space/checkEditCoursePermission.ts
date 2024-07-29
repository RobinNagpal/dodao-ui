import { canEditGitSpace } from '@/app/api/helpers/space/checkEditSpacePermission';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { Space } from '@prisma/client';
import { NextRequest } from 'next/server';
import getBaseUrl from '@/utils/api/getBaseURL';
import axios from 'axios';

export async function checkEditCoursePermission(space: Space, context: NextRequest, courseKey: string): Promise<DoDaoJwtTokenPayload> {
  const { decodedJWT, canEditSpace, user } = await canEditGitSpace(context, space);
  if (!canEditSpace) {
    const response = await axios.get(`${getBaseUrl()}/api/courses/${courseKey}`);
    const course = response.data.course;

    const isAdminOfCourse = !!course?.courseAdmins?.map((admin: any) => admin.toLowerCase()).includes(user?.toLowerCase());

    if (!isAdminOfCourse) {
      throw new Error(
        'Not allowed to edit course :' +
          JSON.stringify({
            decodedJWT,
            rawCourse: course,
          })
      );
    }
  }

  return decodedJWT!;
}
