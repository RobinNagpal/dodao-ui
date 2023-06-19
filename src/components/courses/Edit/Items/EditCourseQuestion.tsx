import CreateQuestion from '@/components/app/Common/CreateQuestion';
import MarkdownEditor from '@/components/app/Markdown/MarkdownEditor';
import Button from '@/components/core/buttons/Button';
import { CourseDetailsFragment, CourseQuestionFragment, Space, TopicQuestionChoiceInput, UpdateTopicQuestionInput } from '@/graphql/generated/generated-types';
import { QuestionType } from '@/types/deprecated/models/enums';
import { QuestionError } from '@/types/errors/error';
import isEqual from 'lodash/isEqual';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface QuestionToUpdate extends CourseQuestionFragment {
  courseKey: string;
  topicKey: string;
  questionUuid: string;
  answerKeys: string[];
  choices: (TopicQuestionChoiceInput & { order: number })[];
  content: string;
  explanation: string;
  hint: string;
  type: string;
  isPristine: boolean;
}

interface Props {
  course: CourseDetailsFragment;
  space: Space;
  topicKey: string;
  currentQuestion?: CourseQuestionFragment;
  selectedQuestionType: string;
  saveQuestion: (question: UpdateTopicQuestionInput) => void;
  cancel: () => void;
}

export const QuestionForm: React.FC<Props> = ({ course, space, topicKey, currentQuestion, selectedQuestionType, saveQuestion, cancel }) => {
  const initialFormState: QuestionToUpdate = {
    uuid: currentQuestion?.uuid || uuidv4(),
    courseKey: course.key,
    topicKey: topicKey,
    questionUuid: currentQuestion?.uuid || uuidv4(),
    answerKeys: currentQuestion?.answerKeys || [],
    choices: (currentQuestion?.choices || [{ key: 'A', content: '' }]).map((choice, index) => ({
      key: choice.key,
      content: choice.content,
      order: index,
    })),
    content: currentQuestion?.content || '',
    type: currentQuestion?.type || selectedQuestionType || QuestionType.SingleChoice,
    explanation: currentQuestion?.explanation || '',
    hint: currentQuestion?.hint || '',
    isPristine: true,
  };

  const [form, setForm] = useState<QuestionToUpdate>(initialFormState);
  const [upserting, setUpserting] = useState(false);
  const [questionErrors, setQuestionErrors] = useState<QuestionError>({});
  const [explanationError, setExplanationError] = useState(false);

  useEffect(() => {
    setExplanationError((form?.explanation?.length || 0) < 2);
  }, [form]);

  // Here are the missing functions
  const updateQuestionDescription = (questionId: string, content: string) => {
    setForm((oldForm) => ({ ...oldForm, content }));
  };

  const updateChoiceContent = (questionId: string, choiceKey: string, content: string) => {
    setForm((oldForm) => {
      const newChoices = oldForm.choices?.map((choice) => {
        if (choice.key === choiceKey) {
          return { ...choice, content };
        } else {
          return choice;
        }
      });

      return { ...oldForm, choices: newChoices };
    });
  };

  const newChoiceKey = () => uuidv4().split('-')[0];

  const addChoice = () => {
    const key = newChoiceKey();
    setForm((oldForm) => {
      const newChoices = [...(oldForm.choices || []), { key, content: '', order: oldForm.choices?.length || 0 }];
      return { ...oldForm, choices: newChoices };
    });
  };

  const removeChoice = (questionId: string, choiceKey: string) => {
    setForm((oldForm) => {
      const newChoices = oldForm.choices?.filter((choice) => choice.key !== choiceKey);
      return { ...oldForm, choices: newChoices };
    });
  };

  const updateAnswers = (questionId: string, choiceKey: string, selected: boolean) => {
    setForm((oldForm) => {
      const newAnswerKeys = selected ? [...(oldForm.answerKeys || []), choiceKey] : oldForm.answerKeys?.filter((answer) => answer !== choiceKey);
      return { ...oldForm, answerKeys: newAnswerKeys };
    });
  };

  const setAnswer = (questionId: string, choiceKey: string) => {
    setForm((oldForm) => {
      const newAnswerKeys = isEqual(oldForm.answerKeys, [choiceKey]) ? [] : [choiceKey];
      return { ...oldForm, answerKeys: newAnswerKeys };
    });
  };

  const updateField = (field: keyof QuestionToUpdate, content: string) => {
    setForm((oldForm) => ({ ...oldForm, [field]: content }));
  };

  const save = async () => {
    form.isPristine = false;
    // Your error checking code here
    setUpserting(true);
    // Your saving code here
    const input: UpdateTopicQuestionInput = {
      answerKeys: form.answerKeys,
      choices: form.choices,
      content: form.content,
      courseKey: form.courseKey,
      explanation: form.explanation,
      hint: form.hint,
      questionType: form.type,
      questionUuid: form.questionUuid,
      topicKey: form.topicKey,
    };
    await saveQuestion(input);
    setUpserting(false);
  };

  // Here is the part that was already converted
  return (
    <div className="flex flex-col justify-between h-full">
      <div className="w-full">
        <CreateQuestion
          addChoice={addChoice}
          item={form as CourseQuestionFragment}
          removeChoice={removeChoice}
          setAnswer={setAnswer}
          updateChoiceContent={updateChoiceContent}
          updateQuestionDescription={updateQuestionDescription}
          updateAnswers={updateAnswers}
          questionErrors={questionErrors}
          updateQuestionType={(type) => setForm({ ...form, type })}
        />
        <div className="mt-4">Hint</div>
        <div className="border border-skin-border rounded-md p-2">
          <MarkdownEditor
            id={course.key + '_details'}
            modelValue={form.hint}
            placeholder="Hint"
            editorStyles={{ height: '100px' }}
            onUpdate={(content) => updateField('hint', content)}
            spaceId={space.id}
            objectId={`${course.key}/${topicKey}`}
            imageType="Course"
          />
        </div>
        <div className="mt-4">Explanation*</div>
        <div className="text-xs">Shown after user submits the chapter</div>
        <div className="border border-skin-border rounded-md p-2">
          <MarkdownEditor
            id={course.key + '_details'}
            modelValue={form.explanation}
            placeholder="Details (at least 2-3 lines)"
            editorStyles={{ height: '250px' }}
            error={!form.isPristine && explanationError}
            onUpdate={(content) => updateField('explanation', content)}
            spaceId={space.id}
            objectId={`${course.key}/${topicKey}`}
            imageType="Course"
          />
        </div>

        {form.isPristine && (form.answerKeys?.length || 0) === 0 && (
          <div className="mb-2 text-red-500">
            <i className="iconfont iconwarning"></i>
            <span className="ml-1">Select the correct option</span>
          </div>
        )}
      </div>
      <div className="flex mt-5">
        <Button variant="outlined" onClick={save} disabled={upserting}>
          Save
        </Button>
        <Button variant="outlined" onClick={cancel} disabled={upserting}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default QuestionForm;
