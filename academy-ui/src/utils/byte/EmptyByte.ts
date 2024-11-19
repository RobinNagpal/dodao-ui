import { ByteDto, ImageDisplayMode } from '@/types/bytes/ByteDto';

import { Question } from '@/types/stepItems/stepItemDto';
import { QuestionType } from '@dodao/web-core/types/deprecated/models/enums';
import { v4 as uuidv4 } from 'uuid';

export const emptyByte = (): Omit<ByteDto, 'id'> & { isPristine: boolean; id: string } => {
  const step1Uuid = uuidv4();
  const step2Uuid = uuidv4();
  const byteUuid = uuidv4();
  const stepItem: Question = {
    uuid: uuidv4(),
    content: 'What is the best pet?',
    choices: [
      {
        key: 'dog_and_cat',
        content: 'Dog And Cat',
      },
      {
        key: 'dog_or_cat',
        content: 'Dog Or Cat',
      },
      {
        key: 'only_dog',
        content: 'Only Dog',
      },
      {
        key: 'only_cat',
        content: 'Only Cat',
      },
    ],
    answerKeys: ['dog_or_cat', 'only_dog', 'only_cat'],
    type: QuestionType.MultipleChoice,
    explanation: 'This is the explanation',
  };
  return {
    id: byteUuid,
    admins: [],
    created: new Date().toISOString(),
    priority: 0,
    tags: [],
    isPristine: true,
    name: 'Tidbit Name',
    content: 'New Tidbit',
    steps: [
      {
        uuid: step1Uuid,
        name: 'Introduction',
        displayMode: ImageDisplayMode.Normal,
        content: `
Introduction Comments 
        `,
        stepItems: [],
      },
      {
        uuid: step2Uuid,
        name: 'Introduction Evaluation',
        displayMode: ImageDisplayMode.Normal,
        content: ``,
        stepItems: [stepItem],
      },
    ],
  };
};
