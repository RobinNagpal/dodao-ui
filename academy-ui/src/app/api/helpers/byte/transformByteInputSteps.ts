import { isQuestion, isUserDiscordConnect, isUserInput } from '@/app/api/helpers/deprecatedSchemas/helpers/stepItemTypes';
import { ByteStepDto } from '@/types/bytes/ByteDto';
import { ByteStepInput, UpsertByteInput } from '@/types/request/ByteRequests';
import { ByteStepItem, Question, UserDiscordConnect, UserInput } from '@/types/stepItems/stepItemDto';

export function transformByteInputSteps(input: UpsertByteInput) {
  return input.steps.map((s: ByteStepInput): ByteStepDto => {
    const stepItems: ByteStepItem[] = s.stepItems.map((si): Question | UserInput | UserDiscordConnect => {
      if (isQuestion(si)) {
        return si as Question;
      }

      if (isUserInput(si)) {
        return si as UserInput;
      }

      if (isUserDiscordConnect(si)) {
        return si as UserDiscordConnect;
      }

      throw new Error(`Unknown step item type ${si.type}`);
    });
    return { ...s, stepItems: stepItems } as ByteStepDto;
  });
}
