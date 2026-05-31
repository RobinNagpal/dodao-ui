import { NextRequest } from 'next/server';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { EtfNote } from '@prisma/client';
import { verifyUserRecordOwnership } from '@/utils/user-record-verification-utils';

export type UpdateEtfNoteRequest = {
  notes?: string;
  score?: number | null;
};

// PUT /api/etf-notes/[noteId] - Update an ETF note
async function putHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: Promise<{ noteId: string }> }): Promise<EtfNote> {
  const { userId } = userContext;
  const { noteId } = await params;

  // Verify the note belongs to the user
  await verifyUserRecordOwnership(prisma.etfNote, noteId, userId, 'Note not found or you do not have permission to update it');

  const updateBody: UpdateEtfNoteRequest = await req.json();

  // Update the ETF note
  const updatedNote = await prisma.etfNote.update({
    where: {
      id: noteId,
    },
    data: {
      notes: updateBody.notes !== undefined ? updateBody.notes : undefined,
      score: updateBody.score !== undefined ? updateBody.score : undefined,
    },
  });

  return updatedNote;
}

// DELETE /api/etf-notes/[noteId] - Remove an ETF note
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ noteId: string }> }
): Promise<{ success: boolean }> {
  const { userId } = userContext;
  const { noteId } = await params;

  // Verify the note belongs to the user
  await verifyUserRecordOwnership(prisma.etfNote, noteId, userId, 'Note not found or you do not have permission to delete it');

  await prisma.etfNote.delete({
    where: {
      id: noteId,
    },
  });

  return { success: true };
}

export const PUT = withLoggedInUser<EtfNote>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
