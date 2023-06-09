import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  CourseDetailsFragment,
  CourseSubmissionFragment,
  CourseTopicFragment,
  GitCourseTopicSubmissionInput,
  Space,
  TopicCorrectAnswersFragment,
  TopicSubmissionFragment,
  useGitCourseSubmissionQuery,
  useSubmitGitCourseMutation,
  useSubmitGitCourseTopicMutation,
  useUpsertGitCourseTopicSubmissionMutation,
} from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { GitCourseSubmissionModel } from '@/types/deprecated/models/course/GitCourseSubmissionModel';
import isEqual from 'lodash/isEqual';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

//... Other necessary imports from your original Vue code
export enum QuestionStatus {
  Skipped = 'Skipped',
  Completed = 'Completed',
  Uncompleted = 'Uncompleted',
}

export enum TopicItemStatus {
  Completed = 'Completed',
  Uncompleted = 'Uncompleted',
}

export enum TopicStatus {
  UnAttempted = 'UnAttempted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Submitted = 'Submitted',
}

export type CourseQuestionSubmission = {
  uuid: string;
  status: QuestionStatus;
  answers: string[];
};

export type ReadingSubmission = {
  uuid: string;
  status: TopicItemStatus;
  questions?: Record<string, CourseQuestionSubmission>;
};

export type SummarySubmission = {
  key: string;
  status: TopicItemStatus;
};

export type ExplanationSubmission = {
  key: string;
  status: TopicItemStatus;
};

export interface TempTopicSubmission {
  uuid: string;
  topicKey: string;
  explanations: Record<string, ExplanationSubmission>;
  questions: Record<string, CourseQuestionSubmission>;
  readings: Record<string, ReadingSubmission>;
  summaries: Record<string, SummarySubmission>;
  correctAnswers?: Record<string, TopicCorrectAnswersFragment>;
  status: TopicStatus;
}

export interface TempCourseSubmission extends GitCourseSubmissionModel {
  topicSubmissionsMap: Record<string, TempTopicSubmission>;
}

function transformTopicSubmissionResponse(sub: TopicSubmissionFragment): TempTopicSubmission {
  const explanations = sub.submission?.explanations || [];
  const questions = sub.submission?.questions || [];
  const readings = sub.submission?.readings || [];
  const summaries = sub.submission?.summaries || [];

  const tempTopicSubmission: TempTopicSubmission = {
    topicKey: sub.topicKey,
    uuid: sub.uuid,
    explanations: Object.fromEntries(explanations.map((explanation) => [explanation.key, explanation as ExplanationSubmission])),
    questions: Object.fromEntries(questions.map((question) => [question.uuid, question as CourseQuestionSubmission])),
    readings: Object.fromEntries(
      readings.map((reading) => {
        const readingsQuestions = reading.questions || [];
        return [
          reading.uuid,
          {
            uuid: reading.uuid,
            status: reading.status as TopicItemStatus,
            questions: Object.fromEntries(readingsQuestions.map((question) => [question.uuid, question as CourseQuestionSubmission])),
          },
        ];
      })
    ),
    summaries: Object.fromEntries(summaries.map((summary) => [summary.key, summary as SummarySubmission])),
    status: sub.status as TopicStatus,
    correctAnswers: sub.correctAnswers ? Object.fromEntries(sub.correctAnswers?.map((correct) => [correct.uuid, correct])) : undefined,
  };
  return tempTopicSubmission;
}

function transformCourseSubmissionResponse(courseSubmissionResponse: CourseSubmissionFragment, course: CourseDetailsFragment): TempCourseSubmission {
  const topicSubmissionsMap: Record<string, TopicSubmissionFragment> =
    Object.fromEntries(courseSubmissionResponse.topicSubmissions?.map((t) => [t.topicKey, t])) || {};
  return {
    uuid: courseSubmissionResponse.uuid,
    courseKey: courseSubmissionResponse.courseKey,
    createdAt: courseSubmissionResponse.createdAt,
    createdBy: courseSubmissionResponse.createdBy,
    galaxyCredentialsUpdated: courseSubmissionResponse.galaxyCredentialsUpdated || undefined,
    isLatestSubmission: courseSubmissionResponse.isLatestSubmission || undefined,
    questionsAttempted: courseSubmissionResponse.questionsAttempted || undefined,
    questionsCorrect: courseSubmissionResponse.questionsCorrect || undefined,
    questionsIncorrect: courseSubmissionResponse.questionsIncorrect || undefined,
    questionsSkipped: courseSubmissionResponse.questionsSkipped || undefined,
    spaceId: courseSubmissionResponse.spaceId,
    status: courseSubmissionResponse.status,
    updatedAt: courseSubmissionResponse.updatedAt,
    topicSubmissionsMap: Object.fromEntries(
      course.topics.map((t) => {
        const topicSubmission: TempTopicSubmission = topicSubmissionsMap[t.key]?.submission
          ? transformTopicSubmissionResponse(topicSubmissionsMap[t.key])
          : {
              uuid: uuidv4(),
              topicKey: t.key,
              explanations: {},
              questions: {},
              readings: {},
              summaries: {},
              status: TopicStatus.InProgress,
            };

        return [topicSubmission.topicKey, topicSubmission];
      })
    ),
  };
}

export interface CourseSubmissionHelper {
  courseSubmission: TempCourseSubmission | undefined;
  loadCourseSubmission: (courseRef: CourseDetailsFragment) => Promise<void>;
  getTopic: (topicKey: string) => CourseTopicFragment;
  saveReading: Function;
  saveReadingAnswer: Function;
  saveSummary: Function;
  saveExplanation: Function;
  saveAnswer: Function;
  submitCourse: Function;
  submitTopic: Function;
  upsertTopicSubmission: Function;
  isAllReadingsComplete: (topic: CourseTopicFragment) => boolean;
  isAllExplanationsComplete: (topic: CourseTopicFragment) => boolean;
  isAllSummariesComplete: (topic: CourseTopicFragment) => boolean;
  isAllEvaluationsComplete: (topic: CourseTopicFragment) => boolean;
  isTopicComplete: (topic: CourseTopicFragment) => boolean;
  isTopicSubmissionInSubmittedStatus: (topicKey: string) => boolean;
  correctAndWrongAnswerCounts: (topicKey: string) => { correctAnswers: number; wrongAnswers: number };
}

export const useCourseSubmission = (space: Space, course: CourseDetailsFragment): CourseSubmissionHelper => {
  const [courseSubmission, setCourseSubmission] = useState<TempCourseSubmission | undefined>();

  const { refetch } = useGitCourseSubmissionQuery({ variables: { courseKey: course.key, spaceId: space.id }, skip: true });
  const { showNotification } = useNotificationContext();
  const { $t } = useI18();
  const [upsertGitCourseTopicSubmissionMutation] = useUpsertGitCourseTopicSubmissionMutation();
  const [submitGitCourseTopicMutation] = useSubmitGitCourseTopicMutation();
  const [submitGitCourseMutation] = useSubmitGitCourseMutation();
  const loadCourseSubmission = async () => {
    const response = await refetch();
    const courseSubmissionResponse = response.data?.payload;

    const submission = transformCourseSubmissionResponse(courseSubmissionResponse!, course);
    setCourseSubmission(submission);
  };

  const isAllReadingsComplete = (topic: CourseTopicFragment) => {
    if (!topic?.readings) return false;
    return topic.readings.every(
      (reading) => courseSubmission?.topicSubmissionsMap?.[topic.key]?.readings?.[reading.uuid]?.status === TopicItemStatus.Completed
    );
  };

  const isAllSummariesComplete = (topic: CourseTopicFragment) => {
    if (!topic?.summaries) return false;
    return topic.summaries.every(
      (summary) => courseSubmission?.topicSubmissionsMap?.[topic.key]?.summaries?.[summary.key]?.status === TopicItemStatus.Completed
    );
  };

  const isAllExplanationsComplete = (topic: CourseTopicFragment) => {
    if (!topic?.explanations?.length) return true;
    return topic.explanations.every(
      (explanation) => courseSubmission?.topicSubmissionsMap?.[topic.key].explanations?.[explanation.key]?.status === TopicItemStatus.Completed
    );
  };

  const isAllEvaluationsComplete = (topic: CourseTopicFragment) => {
    if (!topic?.questions) return false;
    return topic.questions.every((question) => {
      const questionRes: CourseQuestionSubmission | undefined = courseSubmission?.topicSubmissionsMap?.[topic.key]?.questions?.[question.uuid];
      return questionRes?.status === QuestionStatus.Completed && questionRes.answers.length > 0;
    });
  };

  const isTopicSubmissionInSubmittedStatus = (topicKey: string) => {
    const topicSubmission = courseSubmission?.topicSubmissionsMap[topicKey];
    return topicSubmission?.status === TopicStatus.Submitted;
  };

  function getTopic(topicKey: string): CourseTopicFragment {
    const topicInfo: CourseTopicFragment | undefined = course?.topics.find((topic) => topicKey === topic.key);

    if (!topicInfo) throw new Error('No topic found with key :' + topicKey);
    return topicInfo;
  }

  function courseAndTopicSubmission(topicKey: string): {
    courseSub: TempCourseSubmission;
    topicSub: TempTopicSubmission;
  } {
    if (!courseSubmission) throw new Error('No course submission found');
    const topicSubmission = courseSubmission?.topicSubmissionsMap[topicKey];
    if (!topicSubmission) throw new Error('No course submission found');

    return {
      courseSub: courseSubmission,
      topicSub: topicSubmission,
    };
  }

  function getTopicSubmissionInput(courseKey: string, topicKey: string) {
    const topic = getTopic(topicKey);

    const topicSubmission = courseSubmission?.topicSubmissionsMap[topicKey];
    if (!topicSubmission) {
      console.error('No topic submission', courseSubmission?.topicSubmissionsMap);
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      return;
    }
    const readingComplete = isAllReadingsComplete(topic);
    const summaryComplete = isAllSummariesComplete(topic);
    const explanationComplete = isAllExplanationsComplete(topic);
    const evaluationComplete = isAllEvaluationsComplete(topic);

    const status =
      topicSubmission.status === TopicStatus.Submitted
        ? TopicStatus.Submitted
        : readingComplete && summaryComplete && evaluationComplete && explanationComplete
        ? TopicStatus.Completed
        : TopicStatus.InProgress;

    const request: GitCourseTopicSubmissionInput = {
      uuid: topicSubmission.uuid,
      courseKey,
      topicKey,
      summaries: Object.values(topicSubmission?.summaries || {}) || [],
      explanations: Object.values(topicSubmission?.explanations || {}) || [],
      questions: Object.values(topicSubmission?.questions || {}) || [],
      readings:
        Object.values(topicSubmission?.readings || {}).map((reading) => ({
          ...reading,
          questions: reading.questions ? Object.values(reading.questions) : [],
        })) || [],
      status,
    };
    return request;
  }

  const upsertTopicSubmission = async (courseKey: string, topicKey: string) => {
    const request = getTopicSubmissionInput(courseKey, topicKey);
    if (!request) {
      console.error('No topic submission request');
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      return;
    }

    try {
      await upsertGitCourseTopicSubmissionMutation({
        variables: {
          spaceId: space.id,
          gitCourseTopicSubmission: request,
        },
      });
    } catch (e) {
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      throw e;
    }
  };

  const saveSummary = async (chapterId: string, summaryId: string) => {
    const { courseSub, topicSub } = courseAndTopicSubmission(chapterId);
    setCourseSubmission({
      ...courseSub,
      topicSubmissionsMap: {
        ...courseSub.topicSubmissionsMap,
        [chapterId]: {
          ...topicSub,
          summaries: {
            ...topicSub.summaries,
            [summaryId]: {
              key: summaryId,
              status: TopicItemStatus.Completed,
            },
          },
        },
      },
    });
    await upsertTopicSubmission(course.key, chapterId);
  };

  const saveExplanation = async (chapterId: string, explanationKey: string) => {
    const { courseSub, topicSub } = courseAndTopicSubmission(chapterId);
    setCourseSubmission({
      ...courseSub,
      topicSubmissionsMap: {
        ...courseSub.topicSubmissionsMap,
        [chapterId]: {
          ...topicSub,
          explanations: {
            ...topicSub.explanations,
            [explanationKey]: {
              key: explanationKey,
              status: TopicItemStatus.Completed,
            },
          },
        },
      },
    });
    await upsertTopicSubmission(course.key, chapterId);
  };

  const saveReadingAnswer = async (chapterId: string, readingId: string, questionUUid: string, questionResponse: CourseQuestionSubmission) => {
    const { courseSub, topicSub } = courseAndTopicSubmission(chapterId);
    const questions: Record<string, CourseQuestionSubmission> = {
      ...topicSub.readings?.[readingId].questions,
      [questionUUid]: {
        uuid: questionUUid,
        status: questionResponse.status,
        answers: questionResponse.answers,
      },
    };

    const readings: Record<string, ReadingSubmission> = {
      ...topicSub.readings,
      [readingId]: {
        uuid: readingId,
        questions: questions,
        // TODO: this needs to be made dynamic
        status: TopicItemStatus.Completed,
      },
    };
    const topicSubmissionsMap: Record<string, TempTopicSubmission> = {
      ...courseSub.topicSubmissionsMap,
      [chapterId]: {
        ...topicSub,
        readings: readings,
      },
    };
    setCourseSubmission({
      ...courseSub,
      topicSubmissionsMap: topicSubmissionsMap,
    });
    await upsertTopicSubmission(course.key, chapterId);
  };

  const saveReading = async (chapterId: string, readingId: string) => {
    const { courseSub, topicSub } = courseAndTopicSubmission(chapterId);
    const readings: Record<string, ReadingSubmission> = {
      ...topicSub.readings,
      [readingId]: {
        uuid: readingId,
        status: TopicItemStatus.Completed,
      },
    };
    const topicSubmissionsMap: Record<string, TempTopicSubmission> = {
      ...courseSub.topicSubmissionsMap,
      [chapterId]: {
        ...topicSub,
        readings: readings,
      },
    };
    setCourseSubmission({
      ...courseSub,
      topicSubmissionsMap: topicSubmissionsMap,
    });

    await upsertTopicSubmission(course.key, chapterId);
  };

  const saveAnswer = async (chapterId: string, questionUUid: string, questionResponse: CourseQuestionSubmission) => {
    const { courseSub, topicSub } = courseAndTopicSubmission(chapterId);
    setCourseSubmission({
      ...courseSub,
      topicSubmissionsMap: {
        ...courseSub.topicSubmissionsMap,
        [chapterId]: {
          ...topicSub,
          questions: {
            ...topicSub.questions,
            [questionUUid]: {
              uuid: questionUUid,
              answers: questionResponse.answers,
              status: questionResponse.status,
            },
          },
        },
      },
    });

    await upsertTopicSubmission(course.key, chapterId);
  };

  const isTopicComplete = (topic: CourseTopicFragment) => {
    return (
      !!(topic.readings?.length || topic.summaries?.length || topic.questions?.length || topic.explanations?.length) &&
      isAllSummariesComplete(topic) &&
      isAllReadingsComplete(topic) &&
      isAllEvaluationsComplete(topic) &&
      isAllExplanationsComplete(topic)
    );
  };

  const correctAndWrongAnswerCounts = (topicKey: string): { correctAnswers: number; wrongAnswers: number } => {
    const tempTopicSubmission = courseSubmission?.topicSubmissionsMap?.[topicKey];
    if (!tempTopicSubmission) {
      return { correctAnswers: 0, wrongAnswers: 0 };
    }
    const { correctAnswers } = tempTopicSubmission;
    return {
      correctAnswers: Object.values(correctAnswers || {}).filter((correct) =>
        isEqual(correct.answerKeys.sort(), tempTopicSubmission.questions[correct.uuid].answers.sort() || [])
      ).length,
      wrongAnswers: Object.values(correctAnswers || {}).filter(
        (correct) => !isEqual(correct.answerKeys.sort(), tempTopicSubmission.questions[correct.uuid].answers.sort() || [])
      ).length,
    };
  };

  const submitCourseTopic = async (topicKey: string) => {
    if (!isAllEvaluationsComplete(getTopic(topicKey))) {
      showNotification({ type: 'error', message: $t('courses.view.completeAllQuestionOfChapterToSubmit') });
      return;
    }
    const request = getTopicSubmissionInput(course.key, topicKey);
    if (!request) {
      console.error('No topic input');
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      return;
    }

    if (!courseSubmission) {
      console.error('No course submission');
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      return;
    }

    try {
      const submitTopicResponse = await submitGitCourseTopicMutation({
        variables: {
          spaceId: space.id,
          gitCourseTopicSubmission: request,
        },
      });
      const topicSubmitResponse = submitTopicResponse.data?.payload;
      if (topicSubmitResponse) {
        const tempTopicSubmission = transformTopicSubmissionResponse(topicSubmitResponse);

        setCourseSubmission({
          ...courseSubmission,
          topicSubmissionsMap: {
            ...courseSubmission?.topicSubmissionsMap,
            [topicSubmitResponse.topicKey]: tempTopicSubmission,
          },
        });
      } else {
        console.error(submitTopicResponse);
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      }
    } catch (e) {
      console.error(e);
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
    }
  };

  const submitCourse = async () => {
    const submission = courseSubmission;
    if (!submission) {
      console.error('No course submission present');
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      return;
    }

    const areAllQuestionsAttempted = Object.values(submission.topicSubmissionsMap).every((ts) => isAllEvaluationsComplete(getTopic(ts.topicKey)));
    if (!areAllQuestionsAttempted) {
      console.error('All questions are not answered');
      showNotification({ type: 'error', message: $t('courses.view.completeAllChapterQuestionsToSubmit') });

      return;
    }

    try {
      const result = await submitGitCourseMutation({
        variables: {
          spaceId: space.id,
          input: {
            uuid: submission.uuid,
            courseKey: submission.courseKey,
          },
        },
      });

      const submissionResponse = result.data?.payload;
      if (submissionResponse) {
        setCourseSubmission(transformCourseSubmissionResponse(submissionResponse, course));

        showNotification({ type: 'success', message: $t('courses.view.courseSubmitSuccess') });
      } else {
        console.error('courses.view.chapterSubmitError');
        showNotification({ type: 'error', message: $t('courses.view.chapterSubmitError') });
      }
    } catch (e) {
      console.error(e);
      showNotification({ type: 'error', message: $t('courses.view.chapterSubmitError') });
    }
  };

  //... Rest of your functions and transformations

  return {
    courseSubmission,
    loadCourseSubmission,
    getTopic,
    saveReading,
    saveReadingAnswer,
    saveSummary,
    saveExplanation,
    saveAnswer,
    submitCourse,
    submitTopic: submitCourseTopic,
    upsertTopicSubmission,
    isTopicComplete,
    isAllReadingsComplete,
    isAllExplanationsComplete,
    isAllSummariesComplete,
    isAllEvaluationsComplete,
    isTopicSubmissionInSubmittedStatus,
    correctAndWrongAnswerCounts,
  };
};
