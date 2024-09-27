import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { User } from '@prisma/client';

// Set of allowed fields for update
const ALLOWED_UPDATE_FIELDS = new Set(['authProvider', 'email', 'username', 'name', 'phone_number', 'spaceId', 'image', 'publicAddress']);

export async function POST(req: Request) {
  const inputData = await req.json();

  // Filter inputData to include only allowed fields for update
  const fieldsToUpdate = Object.keys(inputData)
    .filter((key) => ALLOWED_UPDATE_FIELDS.has(key))
    .reduce((obj: any, key) => {
      obj[key] = inputData[key];
      return obj;
    }, {});

  const { id } = inputData; // 'id' is always provided for identifying the user

  if (!id) {
    return new Response(JSON.stringify({ error: 'User ID is required.' }), { status: 400 });
  }

  // Optionally, handle emailVerified separately if you always want to set it during update
  fieldsToUpdate.emailVerified = new Date();

  const user = await prisma.user.update({
    where: { id },
    data: { ...fieldsToUpdate },
  });

  return NextResponse.json({ user }, { status: 200 });
}
