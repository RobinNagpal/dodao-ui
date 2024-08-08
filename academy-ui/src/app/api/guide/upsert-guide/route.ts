import { PublishStatus } from '@/app/api/helpers/deprecatedSchemas/models/enums';
import { GuideType } from '@/app/api/helpers/deprecatedSchemas/models/GuideModel';
import { MutationUpsertGuideArgs } from '@/graphql/generated/generated-types';
import { logError } from '@/app/api/helpers/adapters/errorLogger';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { v4 } from 'uuid';

async function postHandler(req: NextRequest) {
  try {
    const { guideInput, spaceId } = (await req.json()) as MutationUpsertGuideArgs;
    const spaceById = await prisma.space.findUniqueOrThrow({ where: { id: spaceId } });
    if (!spaceById) throw new Error(`No space found: ${spaceId}`);

    await checkEditSpacePermission(spaceById, req);

    const existingGuide = await prisma.guide.findUnique({
      where: {
        id: guideInput.id,
      },
    });
    const newVersion = existingGuide ? existingGuide.version + 1 : 1;

    const guide = await prisma.guide.upsert({
      create: {
        id: v4(),
        content: guideInput.content,
        uuid: guideInput.uuid,
        authors: '0x...',
        createdAt: new Date(),
        guideType: guideInput.guideType as GuideType,
        spaceId: spaceId,
        guideName: guideInput.name,
        thumbnail:
          guideInput.thumbnail ||
          // dodao logo
          'https://d31h13bdjwgzxs.cloudfront.net/QmWy8EeMnxqx96VEPx2NBwzqtKxvMQqVVYvmPKgAYS2cUi',
        version: newVersion,
        postSubmissionStepContent: guideInput.postSubmissionStepContent || '',
        publishStatus: guideInput.publishStatus as PublishStatus,
        categories: guideInput.categories,
        socialShareImage: guideInput.socialShareImage || '',
        guideSource: guideInput.guideSource,
        status: guideInput.publishStatus,
        discordRoleIds: [],
      },
      update: {
        content: guideInput.content,
        guideName: guideInput.name,
        thumbnail:
          guideInput.thumbnail ||
          // dodao logo
          'https://d31h13bdjwgzxs.cloudfront.net/QmWy8EeMnxqx96VEPx2NBwzqtKxvMQqVVYvmPKgAYS2cUi',
        version: newVersion,
        postSubmissionStepContent: guideInput.postSubmissionStepContent || '',
        publishStatus: guideInput.publishStatus as PublishStatus,
        categories: guideInput.categories,
        socialShareImage: guideInput.socialShareImage || '',
        status: guideInput.publishStatus,
      },
      where: {
        id: guideInput.id,
      },
    });

    for (const step of guideInput.steps) {
      const stepId = v4();
      await prisma.guideStep.upsert({
        create: {
          id: stepId,
          uuid: step.uuid,
          createdAt: new Date(),
          stepName: step.stepName,
          content: step.content,
          stepItems: step.stepItems.map((item) => {
            return {
              answerKeys: item.answerKeys,
              choices: item.choices?.map((choice) => ({
                content: choice.content,
                key: choice.key,
              })),
              content: item.content,
              label: item.label,
              questionType: item.questionType,
              required: item.required,
              type: item.type,
              uuid: item.uuid,
              explanation: item.explanation,
            };
          }),
          stepOrder: step.stepOrder,
          spaceId: spaceId,
          guideId: guide.id,
        },
        update: {
          content: step.content,
          stepName: step.stepName,
          stepItems: step.stepItems.map((item) => {
            return {
              answerKeys: item.answerKeys,
              choices: item.choices?.map((choice) => ({
                content: choice.content,
                key: choice.key,
              })),
              content: item.content,
              label: item.label,
              questionType: item.questionType,
              required: item.required,
              type: item.type,
              uuid: item.uuid,
              explanation: item.explanation,
            };
          }),
          stepOrder: step.stepOrder,
        },
        where: {
          id: step.id,
        },
      });
    }

    return NextResponse.json({ status: 200, guide });
  } catch (e) {
    await logError((e as any)?.response?.data || 'Error in upsertGuide', {}, e as any, null, null);
    throw e;
  }
}

export const POST = withErrorHandling(postHandler);
