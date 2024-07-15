import { isUserDiscordConnect, isUserInput } from '@/app/api/helpers/deprecatedSchemas/helpers/stepItemTypes';
import { ByteModel, ByteStep } from '@/app/api/helpers/deprecatedSchemas/models/byte/ByteModel';
import { GitCourseTopicModel } from '@/app/api/helpers/deprecatedSchemas/models/course/CourseTopics';
import { GitCourseModel } from '@/app/api/helpers/deprecatedSchemas/models/course/GitCourseModel';
import { InputType } from '@/app/api/helpers/deprecatedSchemas/models/enums';
import { GuideModel, GuideStep, UserInput } from '@/app/api/helpers/deprecatedSchemas/models/GuideModel';
import { prisma } from '@/prisma';
import { Space } from '@prisma/client'; //Update the types from @prisma/client
import axios from 'axios';
import { ByteSubmissionInput, GuideSubmissionInput, GuideSubmissionResult, UserDiscordInfo } from '@/graphql/generated/generated-types';
import { logError } from '@/app/api/helpers/adapters/errorLogger';
import { DiscordAuthor } from '@/app/api/helpers/types/discord';
import { UserGuideStepSubmission } from '@/app/api/helpers/types/guideSubmisstion';

export async function postGuideSubmission(
  url: string,
  guide: GuideModel,
  msg: GuideSubmissionInput,
  guideResult: GuideSubmissionResult,
  stepSubmissionsMap: UserGuideStepSubmission
) {
  let author: DiscordAuthor | undefined = undefined;
  const spaceId = msg.space;

  const space = (await prisma.space.findUnique({ where: { id: spaceId } })) as Space;

  const userInputSteps = guide.steps.filter((step: any) => step.stepItems.some((item: any) => isUserInput(item) && item.type === InputType.PublicShortInput));

  const discordConnectStep = guide.steps.find((step: GuideStep) => step.stepItems.some((item: any) => isUserDiscordConnect(item)));
  const discordConnectItem = discordConnectStep?.stepItems.find((item: any) => isUserDiscordConnect(item));

  if (discordConnectStep && discordConnectItem) {
    const userDiscordInfo: UserDiscordInfo | undefined = stepSubmissionsMap?.[discordConnectStep.uuid]?.[discordConnectItem.uuid].value as UserDiscordInfo;
    if (userDiscordInfo) {
      author = {
        name: userDiscordInfo.username,
        url: `https://discordapp.com/users/${userDiscordInfo.id}`,
        icon_url: `https://cdn.discordapp.com/avatars/${userDiscordInfo.id}/${userDiscordInfo.avatar}.png`,
      };
    }
  }

  const embeds = userInputSteps.map((step: any) => {
    const fields = step.stepItems
      .filter((item: any) => isUserInput(item) && item.type === InputType.PublicShortInput)
      .map((item: any) => ({
        name: (item as UserInput).label,
        value: stepSubmissionsMap?.[step.uuid]?.[item.uuid]?.value || '----',
        inline: true,
      }));

    return {
      title: step.name,
      fields,
    };
  });

  const data = {
    content: `${space.name}: ${guide.name} submitted by ${msg.from} with result ${guideResult.correctQuestions.length}/${guideResult.allQuestions.length}`,
    embeds: author ? [...embeds, { title: `Discord User - ${author.name}`, author }] : embeds,
  };

  axios.post(url, data).catch((err) => {
    console.error('guideSubmission:discordWebhook', err);
    logError('Error posting submission to discord', { data }, err, spaceId, null);
  });
}

export async function postByteSubmission(url: string, byte: ByteModel, msg: ByteSubmissionInput) {
  const spaceId = msg.space;

  const space = (await prisma.space.findUnique({ where: { id: spaceId } })) as Space;

  const data = {
    content: `Byte Submission: ${space.name}: ${byte.name} submitted by ${msg.from}`,
    embeds: [],
  };

  axios.post(url, data).catch((err) => {
    console.error('guideSubmission:discordWebhook', err);
    logError('Error posting submission to discord', { data }, err, spaceId, null);
  });
}

export async function postTopicSubmission(url: string, space: Space, course: GitCourseModel, topic: GitCourseTopicModel, submissionModel: any) {
  const embeds = [
    {
      title: `${course.title} -- ${topic.title}`,
      fields: [
        { name: 'Questions Attempted', value: submissionModel.questionsAttempted || '--', inline: true },
        { name: 'Questions Correct', value: submissionModel.questionsCorrect || '--', inline: true },
        { name: 'Questions Incorrect', value: submissionModel.questionsIncorrect || '--', inline: true },
        { name: 'Questions Skipped', value: submissionModel.questionsSkipped || '--', inline: true },
      ],
    },
  ];
  const data = {
    content: `${space.name}: ${course.title} -- ${topic.title} topic submitted by ${submissionModel.createdBy} with result ${submissionModel.questionsCorrect}/${submissionModel.questionsAttempted}`,
    embeds: embeds,
  };

  axios.post(url, data).catch((err) => {
    console.error('guideSubmission:discordWebhook', err);
    logError('Error posting submission to discord', { data }, err, space.id, null);
  });
}

export async function postCourseSubmission(url: string, space: Space, course: GitCourseModel, submissionModel: any) {
  const embeds = [
    {
      title: `${course.title}`,
      fields: [
        { name: 'Questions Attempted', value: submissionModel.questionsAttempted || '--', inline: true },
        { name: 'Questions Correct', value: submissionModel.questionsCorrect || '--', inline: true },
        { name: 'Questions Incorrect', value: submissionModel.questionsIncorrect || '--', inline: true },
        { name: 'Questions Skipped', value: submissionModel.questionsSkipped || '--', inline: true },
      ],
    },
  ];
  const data = {
    content: `${space.name}: ${course.title} course submitted by ${submissionModel.createdBy} with result ${submissionModel.questionsCorrect}/${submissionModel.questionsAttempted}`,
    embeds: embeds,
  };

  axios.post(url, data).catch((err) => {
    console.error('guideSubmission:discordWebhook', err);
    logError('Error posting submission to discord', { data }, err, space.id, null);
  });
}
