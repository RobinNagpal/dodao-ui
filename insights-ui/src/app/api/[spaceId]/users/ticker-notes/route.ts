import { NextRequest } from 'next/server';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { TickerV1Notes } from '@prisma/client';

export type TickerNotesResponse = {
  tickerNotes: TickerV1Notes[];
};

export type CreateTickerNoteRequest = {
  tickerId: string;
  notes: string;
  score?: number;
};

export type UpdateTickerNoteRequest = {
  notes?: string;
  score?: number | null;
};

// GET /api/ticker-notes - Get all ticker notes for the logged-in user
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<TickerNotesResponse> {
  const { userId } = userContext;

  const tickerNotes = await prisma.tickerV1Notes.findMany({
    where: {
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { tickerNotes };
}

// POST /api/ticker-notes - Add a ticker note
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<TickerV1Notes> {
  const { userId } = userContext;
  const body: CreateTickerNoteRequest = await req.json();

  // Check if the ticker exists
  const ticker = await prisma.tickerV1.findUnique({
    where: {
      id: body.tickerId,
    },
  });

  if (!ticker) {
    throw new Error('Ticker not found');
  }

  // Check if a note already exists for this ticker
  const existingNote = await prisma.tickerV1Notes.findFirst({
    where: {
      userId: userId,
      tickerId: body.tickerId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (existingNote) {
    throw new Error('Note already exists for this ticker');
  }

  // Create the ticker note
  const tickerNote = await prisma.tickerV1Notes.create({
    data: {
      userId: userId,
      tickerId: body.tickerId,
      spaceId: KoalaGainsSpaceId,
      notes: body.notes,
      score: body.score,
      createdBy: userId,
    },
  });

  return tickerNote;
}

// PUT /api/ticker-notes?id={noteId} - Update a ticker note
async function putHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<TickerV1Notes> {
  const { userId } = userContext;
  const { searchParams } = new URL(req.url);
  const noteId = searchParams.get('id');

  if (!noteId) {
    throw new Error('Note ID is required');
  }

  // Verify the note belongs to the user
  const existingNote = await prisma.tickerV1Notes.findFirst({
    where: {
      id: noteId,
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (!existingNote) {
    throw new Error('Note not found or you do not have permission to update it');
  }

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

// DELETE /api/ticker-notes?id={noteId} - Remove a ticker note
async function deleteHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<{ success: boolean }> {
  const { userId } = userContext;
  const { searchParams } = new URL(req.url);
  const noteId = searchParams.get('id');

  if (!noteId) {
    throw new Error('Note ID is required');
  }

  // Verify the note belongs to the user
  const existingNote = await prisma.tickerV1Notes.findFirst({
    where: {
      id: noteId,
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (!existingNote) {
    throw new Error('Note not found or you do not have permission to delete it');
  }

  await prisma.tickerV1Notes.delete({
    where: {
      id: noteId,
    },
  });

  return { success: true };
}

export const GET = withLoggedInUser<TickerNotesResponse>(getHandler);
export const POST = withLoggedInUser<TickerV1Notes>(postHandler);
export const PUT = withLoggedInUser<TickerV1Notes>(putHandler);
export const DELETE = withLoggedInUser<{ success: boolean }>(deleteHandler);
