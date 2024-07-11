import { ByteQuestion, ByteStepItem } from '@/app/api/helpers/deprecatedSchemas/models/byte/ByteModel';
import { QuestionType } from '@/app/api/helpers/deprecatedSchemas/models/enums';
import { AcademyObjectTypes } from '@/app/api/helpers/academy/academyObjectTypes';
import { getAcademyObjectFromRedis } from '@/app/api/helpers/academy/readers/academyObjectReader';
import { logEventInDiscord } from '@/app/api/helpers/adapters/logEventInDiscord';
import { prisma } from '@/prisma';
import { Byte } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const byteId = searchParams.get('byteId');
  if (!byteId) return NextResponse.json({ status: 400, body: 'No byteId provided' });

  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ status: 400, body: 'No spaceId provided' });

  let byte = await prisma.byte.findUnique({
    where: {
      id: byteId,
    },
  });

  if (!byte) {
    logEventInDiscord(spaceId, `Byte not found in Data base: ${byteId}`);
    byte = (await getAcademyObjectFromRedis(spaceId, AcademyObjectTypes.bytes, byteId)) as any;
    if (byte) {
      const newByte: Byte = {
        ...byte,
        id: byte.id,
        steps: byte.steps.map((s, i) => ({
          ...s,
          order: undefined,
          stepItems: ((s.stepItems || []) as ByteStepItem[]).map((si, order) => {
            if (si.type === QuestionType.MultipleChoice || si.type === QuestionType.SingleChoice) {
              const question = si as ByteQuestion;
              if (!question.explanation) {
                throw Error(`explanation is missing in byte question - ${spaceId} - ${newByte.name}`);
              }
            }
            return {
              ...si,
              order: undefined,
            };
          }),
        })),
        completionScreen: byte.completionScreen || null,
      };

      byte = await prisma.byte.create({
        data: { ...newByte, completionScreen: newByte.completionScreen || undefined },
      });
    }
  }

  // If byte is still not found, throw an error or handle it appropriately
  if (!byte) {
    throw new Error('Byte not found');
  }

  return NextResponse.json({ status: 200, byte });
}
