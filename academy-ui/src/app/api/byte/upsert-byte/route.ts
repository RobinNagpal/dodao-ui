import { ByteModel, ByteQuestion, ByteStepItem } from '@/app/api/helpers/deprecatedSchemas/models/byte/ByteModel';
import { QuestionType } from '@/app/api/helpers/deprecatedSchemas/models/enums';
import { ByteStep, UpsertByteInput } from '@/graphql/generated/generated-types';
import { transformByteInputSteps } from '@/app/api/helpers/byte/transformByteInputSteps';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { slugify } from '@/app/api/helpers/space/slugify';
import { prisma } from '@/prisma';
import { Byte } from '@prisma/client';
import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { withErrorHandling } from '../../helpers/middlewares/withErrorHandling';

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

async function post_handler(req: NextRequest) {
  const { spaceId, input, byteCollectionId } = await req.json();
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

  const existingMapping = await prisma.byteCollectionItemMappings.findFirst({
    where: {
      itemId: upsertedByte.id,
      byteCollectionId,
      itemType: ByteCollectionItemType.Byte,
    },
  });

  if (!existingMapping) {
    const byteCollection = await prisma.byteCollection.findUnique({
      where: {
        id: byteCollectionId,
      },
      select: {
        items: true,
      },
    });
    const items = byteCollection?.items;
    let highestOrderNumber = 0;
    if (items && items?.length > 0) {
      const byteItems = items?.filter((item) => item.itemType === ByteCollectionItemType.Byte);
      const orderNumbers = byteItems.map((item) => item.order);
      highestOrderNumber = orderNumbers.length > 0 ? Math.max(...orderNumbers) : 0;
    }

    await prisma.byteCollectionItemMappings.create({
      data: {
        id: uuidv4(),
        itemType: ByteCollectionItemType.Byte,
        order: highestOrderNumber + 1,
        itemId: upsertedByte.id,
        ByteCollection: {
          connect: { id: byteCollectionId },
        },
      },
    });
  }
  return NextResponse.json({ upsertedByte }, { status: 200 });
}

/// Wrapping handle in withErrorHandling
export const POST = withErrorHandling(post_handler);
