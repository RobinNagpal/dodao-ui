import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { UserDto } from '@/types/user/UserDto';

// Set of allowed fields for update
const ALLOWED_UPDATE_FIELDS = new Set(['authProvider', 'email', 'username', 'name', 'phoneNumber', 'spaceId', 'image', 'publicAddress']);

async function putHandler(req: NextRequest, { params }: { params: Promise<{ userId: string }> }): Promise<NextResponse<UserDto>> {
  const inputData = await req.json();
  const { userId } = await params;

  // Filter inputData to include only allowed fields for update
  const fieldsToUpdate = Object.keys(inputData)
    .filter((key) => ALLOWED_UPDATE_FIELDS.has(key))
    .reduce((obj: any, key) => {
      obj[key] = inputData[key];
      return obj;
    }, {});

  // Optionally, handle emailVerified separately if you always want to set it during update
  fieldsToUpdate.emailVerified = new Date();

  const user = await prisma.baseUser.update({
    where: { id: userId },
    data: { ...fieldsToUpdate },
  });

  return NextResponse.json(user as UserDto, { status: 200 });
}

export const PUT = putHandler;
