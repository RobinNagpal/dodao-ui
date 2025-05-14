import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Alert } from '@prisma/client';

async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<Alert> {
  const { id } = await params;

  const deleted = await prisma.alert.delete({
    where: { id },
  });

  return deleted as Alert;
}

export const DELETE = deleteHandler;
