import { ByteDetailsFragment, ByteQuestionFragment } from '@/graphql/generated/generated-types';
import { PublishStatus, QuestionType } from '@/types/deprecated/models/enums';
import { v4 as uuidv4 } from 'uuid';

export const emptyByte = (): ByteDetailsFragment & { isPristine: boolean } => {
  const step1Uuid = uuidv4();
  const step2Uuid = uuidv4();
  const byteUuid = uuidv4();
  const stepItem: ByteQuestionFragment & { __typename: 'ByteQuestion' } = {
    __typename: 'ByteQuestion',
    uuid: uuidv4(),
    content: 'What is the best pet?',
    choices: [
      {
        key: 'dog_and_cat',
        content: 'Dog And Cat',
        order: 0,
      },
      {
        key: 'dog_or_cat',
        content: 'Dog Or Cat',
        order: 1,
      },
      {
        key: 'only_dog',
        content: 'Only Dog',
        order: 2,
      },
      {
        key: 'only_cat',
        content: 'Only Cat',
        order: 3,
      },
    ],
    answerKeys: ['dog_or_cat', 'only_dog', 'only_cat'],
    type: QuestionType.MultipleChoice,
    order: 0,
    explanation: 'This is the explanation',
  };
  return {
    admins: [],
    created: new Date().toISOString(),
    priority: 0,
    tags: [],
    id: byteUuid,
    isPristine: true,
    name: 'Byte Name',
    content: 'New Byte',

    publishStatus: PublishStatus.Live,
    steps: [
      {
        uuid: step1Uuid,
        name: 'Introduction',
        content: `
Introduction Comments 
        `,
        stepItems: [],
        order: 0,
      },
      {
        uuid: step2Uuid,
        name: 'Introduction Evaluation',
        content: ``,
        stepItems: [stepItem],
        order: 1,
      },
    ],
  };
};
