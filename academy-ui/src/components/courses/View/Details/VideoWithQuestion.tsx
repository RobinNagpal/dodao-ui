import Question from '@/components/app/Common/Question';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { CourseSubmissionHelper, QuestionStatus } from '@/components/courses/View/useCourseSubmission';
import CourseVideoContainer from '@/components/courses/View/Video/CourseVideoContainer';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { CourseReadingFragment, CourseReadingQuestionFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { get } from 'lodash';
import { useEffect, useRef, useState } from 'react';

interface Props {
  reading: CourseReadingFragment;
  submissionHelper: CourseSubmissionHelper;
}
export default function VideoWithQuestions({ reading, submissionHelper }: Props) {
  const [expand, setExpand] = useState<boolean>(false);
  const [isShowLink, setIsShowLink] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<CourseReadingQuestionFragment | null>(null);
  const [questionResponses, setQuestionResponses] = useState<Record<string, string[]>>({});
  const player = useRef<any>(null);
  const [currentAnswer, setCurrentAnswer] = useState<any[]>([]);
  const { showNotification } = useNotificationContext();
  const { $t: t } = useI18();

  const handleSkip = () => {
    if (currentQuestion?.uuid) {
      questionResponses[currentQuestion?.uuid] = [];
    }
    submissionHelper.saveReadingAnswer((history as any).location?.pathname.split('/')[2], reading?.uuid, currentQuestion?.uuid!, {
      uuid: currentQuestion?.uuid!,
      status: QuestionStatus.Skipped,
      answers: [],
    });
    setCurrentQuestion(null);
    setIsShowLink(false);
    if (player.current) {
      player.current.playVideo();
    }
  };

  const handleAnswer = () => {
    const currentAnswer = questionResponses[currentQuestion?.uuid!];
    submissionHelper.saveReadingAnswer((history as any).location?.pathname.split('/')[2], reading?.uuid, currentQuestion?.uuid!, {
      uuid: currentQuestion?.uuid!,
      status: QuestionStatus.Completed,
      answers: currentAnswer,
    });

    if (currentAnswer.every((key) => !!currentQuestion?.answerKeys.find((answerKey) => answerKey === key))) {
      showNotification({ type: 'info', message: t('courses.view.answerCorrected') });

      setTimeout(() => {
        player.current?.playVideo();
        setCurrentQuestion(null);
        setIsShowLink(false);
      }, 2000);
    } else {
      showNotification({ type: 'error', message: `Wrong. Explanation: ${currentQuestion?.explanation}` });
    }
  };

  const selectAnswer = (questionId: string, selectedAnswers: string[]) => {
    setQuestionResponses({
      ...questionResponses,
      [questionId]: selectedAnswers,
    });
  };

  useEffect(() => {
    const readingId = reading?.uuid;
    const currentQuestionId = currentQuestion?.uuid;
    const answer = get(
      submissionHelper.courseSubmission,
      `${(history as any).location?.pathname.split('/')[2]}.readings.${readingId}.questions.${currentQuestionId}.answers`,
      []
    );
    setCurrentAnswer(answer);
  }, [submissionHelper.courseSubmission, reading, currentQuestion]);

  useEffect(() => {
    setCurrentQuestion(null);
  }, [reading]);

  return (
    <div>
      <div className="course-video-wrapper expand">
        <div className="m-auto max-constraints">
          <div className={`relative video-container reading-video mx-auto mb-4`}>
            <CourseVideoContainer uuid={reading.uuid} url={reading.url} />
          </div>
          {currentQuestion && (
            <div className={`relative mt-6 ${expand && currentQuestion ? 'block' : 'none'}`}>
              <Question onSelectAnswer={selectAnswer} questionResponse={currentAnswer} question={currentQuestion} />
              <div className={`my-4 ${isShowLink ? 'block' : 'none'}`}>
                <span className="font-bold">{t('courses.view.hint')}:</span> {currentQuestion?.hint}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setIsShowLink(true)}>Hint</Button>
                <Button className="mx-2" onClick={handleAnswer} variant="contained" primary>
                  Answer
                </Button>
                <Button onClick={handleSkip}>Skip</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
