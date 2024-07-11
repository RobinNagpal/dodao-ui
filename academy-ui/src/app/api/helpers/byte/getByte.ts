import { ByteQuestion, ByteStepItem } from '@/app/api/helpers/deprecatedSchemas/models/byte/ByteModel';
import { QuestionType } from '@/app/api/helpers/deprecatedSchemas/models/enums';
import { AcademyObjectTypes } from '@/app/api/helpers/academy/academyObjectTypes';
import { getAcademyObjectFromRedis } from '@/app/api/helpers/academy/readers/academyObjectReader';
import { logEventInDiscord } from '@/app/api/helpers/adapters/logEventInDiscord';
import { prisma } from '@/prisma';
import { Byte } from '@prisma/client';

export async function getByte(spaceId: string, byteId: string): Promise<Byte | undefined> {
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
  return byte;
}
