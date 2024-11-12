import { getByte } from '@/app/api/helpers/byte/getByte';
import { transformByteInputSteps } from '@/app/api/helpers/byte/transformByteInputSteps';
import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import { QuestionType } from '@/app/api/helpers/deprecatedSchemas/models/enums';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { slugify } from '@/app/api/helpers/space/slugify';
import { prisma } from '@/prisma';
import { Prisma } from '@prisma/client';
import { ByteDto, ByteStepDto } from '@/types/bytes/ByteDto';
import { UpsertByteInput } from '@/types/request/ByteRequests';
import { ByteStepItem, Question } from '@/types/stepItems/stepItemDto';
import { TidbitCollectionTags } from '@/utils/api/fetchTags';
import { Byte } from '@prisma/client';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

async function transformInput(spaceId: string, message: UpsertByteInput): Promise<ByteDto> {
  // remove the order and add id if needed
  const byteModel: ByteDto = {
    ...message,
    id: message.id || slugify(message.name),
    steps: message.steps.map(
      (s, i): ByteStepDto =>
        ({
          ...s,
          order: undefined,
          stepItems: (s.stepItems || []).map((si, order): ByteStepItem => {
            if (si.type === QuestionType.MultipleChoice || si.type === QuestionType.SingleChoice) {
              const question = si as Question;
              if (!question.explanation) {
                throw Error(`explanation is missing in byte question - ${spaceId} - ${byteModel.name}`);
              }
            }
            return {
              ...si,
              order: undefined,
            } as ByteStepItem;
          }),
        } as ByteStepDto)
    ),
    completionScreen: message.completionScreen || null,
  };
  return byteModel;
}

async function putHandler(
  req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; byteCollectionId: string; byteId: string }> }
): Promise<NextResponse<ByteDto>> {
  const args: UpsertByteInput = await req.json();
  const { spaceId, byteCollectionId } = await params;
  const spaceById = await getSpaceById(spaceId);
  await checkEditSpacePermission(spaceById, req);
  const transformedByte = await transformInput(spaceId, args);
  const steps: ByteStepDto[] = transformByteInputSteps(args);
  const id = args.id || slugify(args.name);
  const upsertedByte: Byte = await prisma.byte.upsert({
    create: {
      ...transformedByte,
      steps: steps,
      id: id,
      spaceId: spaceId,
      completionScreen: args.completionScreen || undefined,
    },
    update: {
      ...args,
      steps: steps,
      completionScreen: args.completionScreen === null ? Prisma.DbNull : args.completionScreen,
    },
    where: {
      id: id,
    },
  });

  const existingMapping = await prisma.byteCollectionItemMappings.findFirst({
    where: {
      itemId: upsertedByte.id,
      byteCollectionId: byteCollectionId,
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
      const orderNumbers = items.map((item) => item.order);
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
  revalidateTag(TidbitCollectionTags.GET_TIDBIT_COLLECTIONS.toString());
  return NextResponse.json(upsertedByte as ByteDto, { status: 200 });
}

async function getHandler(
  req: NextRequest,
  { params }: { params: { spaceId: string; byteCollectionId: string; byteId: string } }
): Promise<NextResponse<ByteDto>> {
  const { byteId, spaceId } = params;
  return NextResponse.json((await getByte(spaceId, byteId)) as ByteDto, { status: 200 });
}

export const PUT = withErrorHandlingV1<ByteDto>(putHandler);
export const GET = withErrorHandlingV1<ByteDto>(getHandler);
