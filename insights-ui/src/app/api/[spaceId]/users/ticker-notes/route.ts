import { NextRequest } from 'next/server';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { TickerV1Notes } from '@prisma/client';
import { revalidatePortfolioProfileIfExists } from '@/utils/cache-actions';

export type TickerNotesResponse = {
  tickerNotes: TickerV1Notes[];
};

export type CreateTickerNoteRequest = {
  tickerId: string;
  notes: string;
  score?: number;
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

  // Revalidate portfolio profile if user has one
  await revalidatePortfolioProfileIfExists(userId);

  return tickerNote;
}

export const GET = withLoggedInUser<TickerNotesResponse>(getHandler);
export const POST = withLoggedInUser<TickerV1Notes>(postHandler);
