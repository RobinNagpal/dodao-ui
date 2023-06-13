import { ByteQuestionFragmentFragment, CourseQuestionFragment, GuideQuestionFragment, StepItemInputGenericInput } from '@/graphql/generated/generated-types';
import { UserInput } from '@/types/deprecated/models/GuideModel';
import { ChoiceError, QuestionError, StepError, UserInputError } from '@/types/errors/error';

const questionContentLimit = 1024;
const inputLabelLimit = 32;
const choiceContentLimit = 256;

export function validateQuestion(question: GuideQuestionFragment | ByteQuestionFragmentFragment | CourseQuestionFragment, stepError: StepError) {
  const questionError: QuestionError = {};

  if (!question.content || question.content.length > questionContentLimit) {
    questionError.content = true;
  }
  question.choices.forEach((choice) => {
    const choiceError: ChoiceError = {};
    if (!choice.content || choice.content.length > choiceContentLimit) {
      choiceError.content = true;
    }
    if (Object.keys(choiceError).length > 0) {
      if (!questionError.choices) {
        questionError.choices = {};
      }
      questionError.choices[choice.key] = choiceError;
    }
  });

  if (question.answerKeys.length === 0) {
    questionError.answerKeys = true;
  }

  if (Object.keys(questionError).length > 0) {
    if (!stepError.stepItems) {
      stepError.stepItems = {};
    }
    stepError.stepItems[question.uuid] = questionError;
  } else {
    stepError.stepItems?.[question.uuid] && delete stepError.stepItems[question.uuid];
  }
}

export function validateUserInput(userInput: UserInput, stepError: StepError) {
  console.log('userInput', userInput);
  const userInputError: UserInputError = {};
  if (!userInput.label?.trim() || userInput.label.length > inputLabelLimit) {
    userInputError.label = true;
  }

  if (Object.keys(userInputError).length > 0) {
    if (!stepError.stepItems) {
      stepError.stepItems = {};
    }
    stepError.stepItems[userInput.order] = userInputError;
  } else {
    delete stepError.stepItems;
  }
  console.log('stepError', stepError);
}
