import { TempGuideSubmission } from '@/components/guides/View/TempGuideSubmission';
import { UserDiscordInfoInput } from '@/graphql/generated/generated-types';

const GUIDE_SUBMISSION = 'GUIDE-SUBMISSION-V1';
const ANONYMOUS = 'ANONYMOUS';
const account = ANONYMOUS;

const saveGuideSubmission = (guideUuid: string, data: TempGuideSubmission) => {
  const key = `${GUIDE_SUBMISSION}_${account}_${guideUuid}`;
  localStorage.setItem(key, JSON.stringify(data));
};

const readGuideSubmissionsCache = (guideUuid: string): TempGuideSubmission => {
  return JSON.parse(localStorage.getItem(`${GUIDE_SUBMISSION}_${account}_${guideUuid}`) || '{}');
};

const readAllInProgressGuides = () => {
  const guideMap: any = {};
  for (const key in localStorage) {
    if (key.indexOf(`${GUIDE_SUBMISSION}_${account}`) > -1) {
      const parse: TempGuideSubmission = JSON.parse(localStorage.getItem(key) || '{}');
      const guideHasSomeUserResponse =
        !parse.isSubmitted && (Object.values(parse?.stepResponsesMap || {}) || []).some((step: any) => Object.values(step.itemResponsesMap || {}).length > 0);
      const guideUuid = key.split('_')[2];
      guideMap[guideUuid] = guideHasSomeUserResponse;
    }
  }
  return guideMap;
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
  discordInfo: UserDiscordInfoInput
) => {
  let guideSubmissionRef: TempGuideSubmission = readGuideSubmissionsCache(guideUuid);
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
  readAllInProgressGuides,
  setUserDiscordInSubmission,
};
