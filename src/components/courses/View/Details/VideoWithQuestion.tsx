import Question from '@/components/app/Common/Question';
import CloseIcon from '@/components/app/Icons/CloseIcon';
import Button from '@/components/core/buttons/Button';
import YoutubePlayer from '@/components/courses/View/Details/YoutubePlayer';
import { CourseSubmissionHelper, QuestionStatus } from '@/components/courses/View/useCourseSubmission';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { CourseReadingFragment, CourseReadingQuestionFragment } from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { get } from 'lodash';
import { useEffect, useRef, useState } from 'react';

interface Props {
  reading: CourseReadingFragment;
  submissionHelper: CourseSubmissionHelper;
}
const VideoGuide: React.FC<Props> = ({ reading, submissionHelper }) => {
  const [expand, setExpand] = useState<boolean>(false);
  const [isShowLink, setIsShowLink] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<CourseReadingQuestionFragment | null>(null);
  const [questionResponses, setQuestionResponses] = useState<Record<string, string[]>>({});
  const player = useRef<any>(null);
  const [currentAnswer, setCurrentAnswer] = useState<any[]>([]);
  const { showNotification } = useNotificationContext();
  const { $t: t } = useI18();
  const handleFullScreen = () => {
    setExpand(!expand);
  };

  const onReady = (playerApi: any) => {
    player.current = playerApi;
  };

  const videoId = new URLSearchParams('?' + reading?.url.split('?')[1]).get('v') || '';

  const marks = reading?.questions?.map((question: any) => question.timeInSec);

  const handleReachMarker = (time: number) => {
    setExpand(true);
    setIsShowLink(false);
    const questions: CourseReadingQuestionFragment[] = reading?.questions || [];
    setCurrentQuestion(questions.find((question: CourseReadingQuestionFragment) => question.timeInSec === time) || null);
    player.current?.pauseVideo();
  };

  const handleSkip = () => {
    if (currentQuestion?.uuid) {
      questionResponses[currentQuestion?.uuid] = [];
    }
    submissionHelper.saveReadingAnswer((history as any).location?.pathname.split('/')[2], reading?.uuid, currentQuestion?.uuid, {
      status: QuestionStatus.Skipped,
      answers: null,
    });
    setCurrentQuestion(null);
    setIsShowLink(false);
    if (player.current) {
      player.current.playVideo();
    }
  };

  const handleAnswer = () => {
    const currentAnswer = questionResponses[currentQuestion?.uuid!];
    submissionHelper.saveReadingAnswer((history as any).location?.pathname.split('/')[2], reading?.uuid, currentQuestion?.uuid, {
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

  const closeFullScreen = () => {
    setExpand(false);
    player.current?.pauseVideo();
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
    <div style={{ display: expand ? 'block' : 'none' }}>
      <div className="course-video-wrapper expand">
        <div className="m-auto max-constraints">
          <div className={`flex flex-row-reverse max-w-full justify-end fixed top-[60px] right-0 ${expand ? 'block' : 'none'}`}>
            <span onClick={closeFullScreen} className="close-icon cursor-pointer">
              <CloseIcon />
            </span>
          </div>

          <div className={`relative video-container reading-video mx-auto mb-4 ${expand && !currentQuestion ? 'block' : 'none'}`}>
            <YoutubePlayer
              marks={marks}
              onPlayerReady={onReady}
              onMarkReach={handleReachMarker}
              fullScreen={handleFullScreen}
              elemId="video-guide"
              videoId={videoId}
            />
          </div>
          <div className={`relative mt-6 ${expand && currentQuestion ? 'block' : 'none'}`}>
            {currentQuestion && <Question onSelectAnswer={selectAnswer} questionResponse={currentAnswer} question={currentQuestion} />}
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
        </div>
      </div>
      <img
        alt={reading?.title}
        src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
        style={{ cursor: 'pointer', display: !expand ? 'block' : 'none' }}
        className="mb-4"
        onClick={() => setExpand(true)}
      />
    </div>
  );
};
