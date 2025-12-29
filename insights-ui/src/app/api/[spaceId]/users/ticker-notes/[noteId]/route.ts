import { NextRequest } from 'next/server';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { TickerV1Notes } from '@prisma/client';
import { revalidatePortfolioProfileIfExists } from '@/utils/cache-actions';
import { verifyUserRecordOwnership } from '@/utils/user-record-verification-utils';

export type UpdateTickerNoteRequest = {
  notes?: string;
  score?: number | null;
};

// PUT /api/ticker-notes/[noteId] - Update a ticker note
async function putHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload, { params }: { params: Promise<{ noteId: string }> }): Promise<TickerV1Notes> {
  const { userId } = userContext;
  const { noteId } = await params;

  // Verify the note belongs to the user
  await verifyUserRecordOwnership(prisma.tickerV1Notes, noteId, userId, 'Note not found or you do not have permission to update it');

  const updateBody: UpdateTickerNoteRequest = await req.json();

  // Update the ticker note
  const updatedNote = await prisma.tickerV1Notes.update({
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

// DELETE /api/ticker-notes/[noteId] - Remove a ticker note
async function deleteHandler(
  req: NextRequest,
  userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ noteId: string }> }
): Promise<{ success: boolean }> {
  const { userId } = userContext;
  const { noteId } = await params;

  // Verify the note belongs to the user
  await verifyUserRecordOwnership(prisma.tickerV1Notes, noteId, userId, 'Note not found or you do not have permission to delete it');

  await prisma.tickerV1Notes.delete({
    where: {
      id: noteId,
    },
  });

  // Revalidate portfolio profile if user has one
  await revalidatePortfolioProfileIfExists(userId);

  return { success: true };
}

export const PUT = withLoggedInUser<TickerV1Notes>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
