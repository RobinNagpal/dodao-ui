import { ByteModel, ByteQuestion, ByteStepItem } from '@/app/api/helpers/deprecatedSchemas/models/byte/ByteModel';
import { QuestionType } from '@/app/api/helpers/deprecatedSchemas/models/enums';
import { ByteStep, MutationUpsertByteArgs, UpsertByteInput } from '@/graphql/generated/generated-types';
import { transformByteInputSteps } from '@/app/api/helpers/byte/transformByteInputSteps';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { logError } from '@/app/api/helpers/adapters/errorLogger';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { slugify } from '@/app/api/helpers/space/slugify';
import { prisma } from '@/prisma';
import { Byte } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

async function transformInput(spaceId: string, message: UpsertByteInput): Promise<ByteModel> {
  // remove the order and add id if needed
  const byteModel: ByteModel = {
    ...message,
    id: message.id || slugify(message.name),
    steps: message.steps.map((s, i) => ({
      ...s,
      order: undefined,
      stepItems: ((s.stepItems || []) as ByteStepItem[]).map((si, order) => {
        if (si.type === QuestionType.MultipleChoice || si.type === QuestionType.SingleChoice) {
          const question = si as ByteQuestion;
          if (!question.explanation) {
            throw Error(`explanation is missing in byte question - ${spaceId} - ${byteModel.name}`);
          }
        }
        return {
          ...si,
          order: undefined,
        };
      }),
    })),
    completionScreen: message.completionScreen || null,
  };
  return byteModel;
}

export async function POST(req: NextRequest) {
  try {
    const { spaceId, input }: MutationUpsertByteArgs = await req.json();
    const spaceById = await getSpaceById(spaceId);
    await checkEditSpacePermission(spaceById, req);
    const transformedByte = await transformInput(spaceId, input);
    const steps: ByteStep[] = transformByteInputSteps(input);
    const id = input.id || slugify(input.name);
    const upsertedByte: Byte = await prisma.byte.upsert({
      create: {
        ...transformedByte,
        steps: steps,
        id: id,
        spaceId: spaceId,
        completionScreen: input.completionScreen || undefined,
      },
      update: {
        ...input,
        steps: steps,
        completionScreen: input.completionScreen || undefined,
      },
      where: {
        id: id,
      },
    });

    return NextResponse.json({ status: 200, upsertedByte });
  } catch (e) {
    await logError((e as any)?.response?.data || 'Error in upsertByte', {}, e as any, null, null);
    throw e;
  }
}
