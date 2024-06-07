import { EditGuideType } from '@/components/guides/Edit/editGuideType';
import { GuideInput, Space } from '@/graphql/generated/generated-types';
import { InputType, PublishStatus, QuestionType } from '@dodao/web-core/types/deprecated/models/enums';
import { GuideSource } from '@dodao/web-core/types/deprecated/models/GuideModel';
import { v4 as uuidv4 } from 'uuid';

export const emptyGuide = (from: string, space: Space, guideType: string): EditGuideType => {
  const step1Uuid = uuidv4();
  const step2Uuid = uuidv4();
  const guideUuid = uuidv4();

  // If the space has an academy repository, then the guide is from the academy, else if
  // it has a git guide repository, then the guide is from git, else it is from the database
  const guideSource = space.spaceIntegrations?.academyRepository ? GuideSource.Academy : GuideSource.Database;

  return {
    id: guideUuid,
    isPristine: true,
    uuid: guideUuid,
    name: 'Guide Name',
    categories: [],
    content: 'New Guide',
    guideIntegrations: {
      discordRoleIds: [],
    },
    guideSource,
    guideType: guideType,
    publishStatus: PublishStatus.Live,
    version: 0,
    authors: [],
    createdAt: new Date().toISOString(),
    guideExists: false,
    steps: [
      {
        id: step1Uuid,
        uuid: step1Uuid,
        name: 'Introduction',
        content: `
Introduction Comments 
        `,
        order: 0,
        stepItems: [
          {
            __typename: 'GuideUserInput',
            label: 'Full Name',
            type: InputType.PublicShortInput,
            uuid: uuidv4(),
            required: false,
            order: 0,
          },
        ],
      },
      {
        id: step2Uuid,
        uuid: step2Uuid,
        name: 'Introduction Evaluation',
        content: ``,
        order: 1,
        stepItems: [
          {
            __typename: 'GuideUserInput',
            order: 0,
            label: 'Full Name',
            type: InputType.PublicShortInput,
            uuid: uuidv4(),
            required: false,
          },
          {
            __typename: 'GuideQuestion',
            order: 1,
            uuid: uuidv4(),
            content: 'Contents of the question',
            choices: [
              {
                key: 'choice_1',
                content: 'Choice 1',
              },
              {
                key: 'choice_2',
                content: 'Choice 2',
              },
              {
                key: 'choice_3',
                content: 'Choice 3',
              },
              {
                key: 'choice_4',
                content: 'Choice 4',
              },
            ],
            answerKeys: ['choice_1', 'choice_2', 'choice_3'],
            type: QuestionType.MultipleChoice,
            explanation: 'Explanation of the question',
          },
        ],
      },
    ],
  };
};
