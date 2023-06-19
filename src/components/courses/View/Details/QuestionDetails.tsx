import IconButton from '@/components/core/buttons/IconButton';
import Question from '@/components/app/Common/Question';
import { IconTypes } from '@/components/core/icons/IconTypes';
import Button from '@/components/core/buttons/Button';
import EditCourseQuestion from '@/components/courses/Edit/Items/EditCourseQuestion';
import { useDeleteCourseItem } from '@/components/courses/Edit/useDeleteCourseItem';
import { useEditCourseDetails } from '@/components/courses/Edit/useEditCourseDetails';
import { useMoveCourseItem } from '@/components/courses/Edit/useMoveCourseItem';
import { CourseSubmissionHelper, QuestionStatus } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import { useLoginModalContext } from '@/contexts/LoginModalContext';
import { CourseDetailsFragment, DeleteTopicQuestionInput, MoveTopicQuestionInput, Space, UpdateTopicQuestionInput } from '@/graphql/generated/generated-types';
import { MoveCourseItemDirection } from '@/types/deprecated/models/enums';
import isEqual from 'lodash/isEqual';
import { useSession } from 'next-auth/react';
import sortBy from 'lodash/sortBy';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import EvaluationReview from './EvaluationReview';

interface QuestionDetailsProps {
  course: CourseDetailsFragment;
  isCourseAdmin: boolean;
  space: Space;
  topicKey: string;
  courseHelper: CourseHelper;
  submissionHelper: CourseSubmissionHelper;

  questionIndex: string;
}

const QuestionContainer = styled.div<{ isTopicSubmitted: boolean; isCorrectAnswer: boolean }>`
  ${(props) =>
    props.isTopicSubmitted &&
    !props.isCorrectAnswer &&
    `
    border: 2px solid red;
    border-radius: .375rem; // 6px
    padding: 1rem; // 16px
  `}
`;

const CorrectAnswerContainer = styled.div<{ isTopicSubmitted: boolean; isCorrectAnswer: boolean }>`
  ${(props) =>
    props.isTopicSubmitted &&
    !props.isCorrectAnswer &&
    `
    border: 2px solid green;
    border-radius: .375rem; // 6px
    padding: 1rem; // 16px
    margin-top: 1rem; // 16px
  `}
`;

export default function QuestionDetails(props: QuestionDetailsProps) {
  const { data: session } = useSession();
  const { setShowLoginModal } = useLoginModalContext();

  const { course, isCourseAdmin, space, topicKey, courseHelper, submissionHelper } = props;
  const questionIndex = parseInt(props.questionIndex, 10);
  // previous setup code here...
  const [nextButtonClicked, setNextButtonClicked] = useState(false);

  const isTopicSubmitted = props.submissionHelper.isTopicSubmissionInSubmittedStatus(props.topicKey);
  const currentQuestion = courseHelper.getTopicQuestionByIndex(topicKey, questionIndex);
  const topic = courseHelper.getTopic(topicKey);

  const [questionResponse, setQuestionResponse] = useState<string[]>([]);
  useEffect(() => {
    setQuestionResponse(
      (currentQuestion && props.submissionHelper.courseSubmission?.topicSubmissionsMap?.[props.topicKey]?.questions?.[currentQuestion.uuid]?.answers) || []
    );
  }, [currentQuestion, props.submissionHelper.courseSubmission, props.topicKey]);

  const [showQuestionsCompletionWarning, setShowQuestionsCompletionWarning] = useState(false);
  useEffect(() => {
    setShowQuestionsCompletionWarning(nextButtonClicked && !questionResponse.length);
  }, [nextButtonClicked, questionResponse]);

  const router = useRouter();

  const handleSkip = async () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }
    props.submissionHelper.saveAnswer(props.topicKey, currentQuestion?.uuid, {
      status: QuestionStatus.Skipped,
      answers: [],
    });
    if (questionIndex === (topic.questions?.length || 0) - 1) {
      router.push(`/courses/view/${course.key}/${topic.key}/submit`);
    } else {
      router.push(`/courses/view/${course.key}/${topic.key}/questions/${questionIndex + 1}`);
    }
    setNextButtonClicked(false);
  };

  const handleNext = async () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }
    setNextButtonClicked(true);
    if (!questionResponse.length) {
      return;
    }
    await props.submissionHelper.saveAnswer(props.topicKey, currentQuestion?.uuid, {
      status: questionResponse.length > 0 ? QuestionStatus.Completed : QuestionStatus.Uncompleted,
      answers: questionResponse,
    });

    if (questionIndex === (topic.questions?.length || 0) - 1) {
      router.push(`/courses/view/${course.key}/${topic.key}/submission`);
    } else {
      router.push(`/courses/view/${course.key}/${topic.key}/questions/${questionIndex + 1}`);
    }
    setNextButtonClicked(false);
  };

  async function selectAnswer(questionId: string, selectedAnswers: string[]) {
    await props.submissionHelper.saveAnswer(props.topicKey, currentQuestion?.uuid, {
      status: selectedAnswers?.length > 0 ? QuestionStatus.Completed : QuestionStatus.Uncompleted,
      answers: selectedAnswers,
    });
  }

  const { editMode, cancel, showEdit, save } = useEditCourseDetails<UpdateTopicQuestionInput>(
    async (updates: UpdateTopicQuestionInput) => await props.courseHelper.updateTopicQuestion(updates)
  );

  const { deleting, deleteItem } = useDeleteCourseItem<DeleteTopicQuestionInput>(
    async (updates: DeleteTopicQuestionInput) => await props.courseHelper.deleteTopicQuestion(updates)
  );

  function doDelete() {
    if (currentQuestion) {
      deleteItem({ courseKey: props.course.key, topicKey: props.topicKey, questionUuid: currentQuestion?.uuid });
    }
  }

  const { movingUp, movingDown, moveItem } = useMoveCourseItem<MoveTopicQuestionInput>(
    async (updates: MoveTopicQuestionInput) => await props.courseHelper.moveTopicQuestion(updates)
  );

  function doMove(direction: MoveCourseItemDirection) {
    if (currentQuestion) {
      moveItem({
        courseKey: props.course.key,
        topicKey: props.topicKey,
        questionUuid: currentQuestion?.uuid,
        direction: direction,
      });
    }
  }

  const isCorrectAnswer = isEqual(sortBy(currentQuestion?.answerKeys), sortBy(questionResponse));

  if (editMode && currentQuestion) {
    return (
      <EditCourseQuestion
        course={course}
        space={space}
        topicKey={topicKey}
        currentQuestion={currentQuestion}
        saveQuestion={save}
        cancel={cancel}
        selectedQuestionType={currentQuestion.type}
      />
    );
  }

  if (!editMode && currentQuestion) {
    return (
      <div className="h-full flex flex-col justify-between">
        <div>
          <EvaluationReview
            space={space}
            course={course}
            topicKey={topicKey}
            courseHelper={courseHelper}
            submissionHelper={submissionHelper}
            isCourseAdmin={isCourseAdmin}
          />
          <div className="h-full pt-4 border-t border-skin-border">
            <div className="flex justify-between w-full">
              <h1 className="mb-4">Question {questionIndex + 1}</h1>
              {isCourseAdmin && (
                <div className="flex">
                  <IconButton iconName={IconTypes.Edit} removeBorder onClick={showEdit} />
                  <IconButton
                    iconName={IconTypes.MoveUp}
                    removeBorder
                    loading={movingUp}
                    disabled={movingUp || movingDown || questionIndex === 0}
                    onClick={() => doMove(MoveCourseItemDirection.Up)}
                  />
                  <IconButton
                    iconName={IconTypes.MoveDown}
                    removeBorder
                    loading={movingDown}
                    disabled={movingUp || movingDown || questionIndex === topic.questions.length - 1}
                    onClick={() => doMove(MoveCourseItemDirection.Down)}
                  />
                  <IconButton iconName={IconTypes.Trash} removeBorder disabled={deleting} loading={deleting} onClick={doDelete} />
                </div>
              )}
            </div>
            <QuestionContainer isTopicSubmitted={isTopicSubmitted} isCorrectAnswer={isCorrectAnswer}>
              {isTopicSubmitted && !isCorrectAnswer && <h3>Your Selection</h3>}
              <Question
                onSelectAnswer={selectAnswer}
                answerClass={isTopicSubmitted && isCorrectAnswer ? 'correct-answer' : ''}
                questionResponse={questionResponse}
                question={currentQuestion}
                readonly={isTopicSubmitted}
                showHint={!isTopicSubmitted && !!props.course.topicConfig?.showHints}
              />
              {isTopicSubmitted && isCorrectAnswer && props.course.topicConfig?.showExplanations && (
                <div className="p-2 mt-2">
                  <h4 className="text-lg mb-2">Explanation</h4>
                  <p>{currentQuestion.explanation}</p>
                </div>
              )}
            </QuestionContainer>

            {isTopicSubmitted && !isCorrectAnswer && (
              <CorrectAnswerContainer isTopicSubmitted={isTopicSubmitted} isCorrectAnswer={isCorrectAnswer}>
                <h3>Correct Answer</h3>
                <Question
                  onSelectAnswer={() => {}}
                  answerClass="correct-answer"
                  questionResponse={currentQuestion.answerKeys || []}
                  question={currentQuestion}
                  readonly={true}
                />
                {isTopicSubmitted && !isCorrectAnswer && props.course.topicConfig?.showExplanations && (
                  <div>
                    <h3>Explanation</h3>
                    <p>{currentQuestion.explanation}</p>
                  </div>
                )}
              </CorrectAnswerContainer>
            )}
          </div>
        </div>

        <div>
          {showQuestionsCompletionWarning && (
            <div className="mb-2 text-red-500 flex items-center">
              <i className="iconfont iconwarning"></i>
              <span className="ml-1">{`Answer question or select "Skip" to proceed`}</span>
            </div>
          )}
          <div className="flex flex-between mt-4 flex-1 items-end p-2">
            {questionIndex > 0 && (
              <Link href={`/courses/view/${course.key}/${topic.key}/questions/${questionIndex - 1}`}>
                <Button>
                  <span className="mr-2 font-bold">&#8592;</span>
                  Previous
                </Button>
              </Link>
            )}
            <div className="flex-1"></div>

            <Button onClick={handleSkip} primary variant="outlined">
              Skip
            </Button>

            <Button onClick={handleNext} primary variant="contained" className="ml-4">
              Next
              <span className="ml-2 font-bold">&#8594;</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
