import { NextRequest } from 'next/server';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withLoggedInUser } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { EtfNote } from '@prisma/client';
import { ETF_MAX_SCORE, validateScore } from '@/utils/score-validation-utils';

export type EtfNotesResponse = {
  etfNotes: EtfNote[];
};

export type CreateEtfNoteRequest = {
  etfId: string;
  notes: string;
  score?: number;
};

// GET /api/etf-notes - Get all ETF notes for the logged-in user
async function getHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<EtfNotesResponse> {
  const { userId } = userContext;

  const etfNotes = await prisma.etfNote.findMany({
    where: {
      userId: userId,
      spaceId: KoalaGainsSpaceId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { etfNotes };
}

// POST /api/etf-notes - Add an ETF note
async function postHandler(req: NextRequest, userContext: DoDaoJwtTokenPayload): Promise<EtfNote> {
  const { userId } = userContext;
  const body: CreateEtfNoteRequest = await req.json();

  // Never trust the client-supplied score — the UI bounds it, the API must too.
  const score = validateScore(body.score, ETF_MAX_SCORE);

  // Check if the ETF exists
  const etf = await prisma.etf.findUnique({
    where: {
      id: body.etfId,
    },
  });

  if (!etf) {
    throw new Error('ETF not found');
  }

  // Check if a note already exists for this ETF
  const existingNote = await prisma.etfNote.findFirst({
    where: {
      userId: userId,
      etfId: body.etfId,
      spaceId: KoalaGainsSpaceId,
    },
  });

  if (existingNote) {
    throw new Error('Note already exists for this ETF');
  }

  // Create the ETF note
  const etfNote = await prisma.etfNote.create({
    data: {
      userId: userId,
      etfId: body.etfId,
      spaceId: KoalaGainsSpaceId,
      notes: body.notes,
      score: score,
      createdBy: userId,
    },
  });

  return etfNote;
}

export const GET = withLoggedInUser<EtfNotesResponse>(getHandler);
export const POST = withLoggedInUser<EtfNote>(postHandler);
