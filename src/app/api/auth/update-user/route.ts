import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function PUT(request: Request) {
  const { name, email, phone_number, username, spaceId } = await request.json();
  try {
    const updatedUser = await prisma.user.update({
      where: { username_spaceId: { username, spaceId } },
      data: { name, email, phone_number },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
