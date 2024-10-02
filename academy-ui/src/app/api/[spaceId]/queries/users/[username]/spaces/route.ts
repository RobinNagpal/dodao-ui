import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma'; 
import { Space } from '@prisma/client'; 

export async function GET(req: NextRequest, { params }: { params: { username: string, spaceId: string } }): Promise<NextResponse<Space[]>> {
    const { username } = params;

    const spaceIds = await prisma.user.findMany({
        where: { username: username },
        select: { spaceId: true },
      }).then(users => users.map(user => user.spaceId));
      
    let spaces : Space[];

    if (spaceIds.length === 0) {
        spaces = []
    } else {
        spaces = await prisma.space.findMany({
          where: { id: { in: spaceIds } },
        });
    }

    return NextResponse.json(spaces as Space[], { status: 200 });
}
