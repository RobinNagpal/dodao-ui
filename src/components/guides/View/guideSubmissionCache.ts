import { TempGuideSubmission } from '@/components/guides/View/TempGuideSubmission';
import { UserDiscordInfoInput } from '@/graphql/generated/generated-types';

const GUIDE_SUBMISSION = 'GUIDE-SUBMISSION-V2';
const ANONYMOUS = 'ANONYMOUS';
const account = ANONYMOUS;

const saveGuideSubmission = (guideUuid: string, data: TempGuideSubmission) => {
  const key = `${account}_${guideUuid}`;
  const guideSubmissions = localStorage.getItem(GUIDE_SUBMISSION);

  if (guideSubmissions) {
    const existingGuideSubmissions = JSON.parse(guideSubmissions);
    const submissions = {
      ...existingGuideSubmissions,
      [key]: data,
    };

    localStorage.setItem(GUIDE_SUBMISSION, JSON.stringify(submissions));
  } else {
    const submissions = {
      [key]: data,
    };

    localStorage.setItem(GUIDE_SUBMISSION, JSON.stringify(submissions));
  }
};

const readGuideSubmissionsCache = (guideUuid: string): TempGuideSubmission | undefined => {
  const submissions = JSON.parse(localStorage.getItem(GUIDE_SUBMISSION) || '{}');
  const key = `${account}_${guideUuid}`;
  return submissions[key];
};

const deleteGuideSubmission = (guideUuid: string) => {
  const key = `${GUIDE_SUBMISSION}_${account}_${guideUuid}`;
  localStorage.removeItem(key);
};

const setUserDiscordInSubmission = (
  guideUuid: string,
  activeStepOrder: number,
  stepUuid: string,
  userDiscordUuid: string,
  discordInfo: UserDiscordInfoInput,
) => {
  let guideSubmissionRef: TempGuideSubmission | undefined = readGuideSubmissionsCache(guideUuid);
  if (!guideSubmissionRef) {
    return;
  }
  guideSubmissionRef = {
    ...guideSubmissionRef,
    stepResponsesMap: {
      ...guideSubmissionRef.stepResponsesMap,
      [stepUuid]: {
        ...guideSubmissionRef.stepResponsesMap?.[stepUuid],
        itemResponsesMap: {
          ...guideSubmissionRef.stepResponsesMap?.[stepUuid]?.itemResponsesMap,
          [userDiscordUuid]: {
            id: discordInfo.id,
            accessToken: discordInfo.accessToken,
            avatar: discordInfo.avatar,
            discriminator: discordInfo.discriminator,
            email: discordInfo.email,
            username: discordInfo.username,
          },
        },
      },
    },
  };
  saveGuideSubmission(guideUuid, guideSubmissionRef);
};

export default {
  saveGuideSubmission,
  deleteGuideSubmission,
  readGuideSubmissionsCache,
  setUserDiscordInSubmission,
};
