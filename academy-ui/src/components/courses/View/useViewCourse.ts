import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import {
  AddTopicExplanationInput,
  AddTopicInput,
  AddTopicQuestionInput,
  AddTopicQuestionsInput,
  AddTopicSummaryInput,
  AddTopicVideoInput,
  CourseBasicInfoInput,
  CourseDetailsFragment,
  CourseExplanationFragment,
  CourseQuestionFragment,
  CourseReadingFragment,
  CourseSummaryFragment,
  CourseTopicFragment,
  DeleteTopicExplanationInput,
  DeleteTopicInput,
  DeleteTopicQuestionInput,
  DeleteTopicSummaryInput,
  DeleteTopicVideoInput,
  MoveTopicExplanationInput,
  MoveTopicInput,
  MoveTopicQuestionInput,
  MoveTopicSummaryInput,
  MoveTopicVideoInput,
  Space,
  UpdateTopicBasicInfoInput,
  UpdateTopicExplanationInput,
  UpdateTopicQuestionInput,
  UpdateTopicSummaryInput,
  UpdateTopicVideoInput,
  useAddTopicExplanationMutation,
  useAddTopicMutation,
  useAddTopicQuestionMutation,
  useAddTopicQuestionsMutation,
  useAddTopicSummaryMutation,
  useAddTopicVideoMutation,
  useDeleteTopicExplanationMutation,
  useDeleteTopicMutation,
  useDeleteTopicQuestionMutation,
  useDeleteTopicSummaryMutation,
  useDeleteTopicVideoMutation,
  useGitCourseQueryQuery,
  useMoveTopicExplanationMutation,
  useMoveTopicMutation,
  useMoveTopicQuestionMutation,
  useMoveTopicSummaryMutation,
  useMoveTopicVideoMutation,
  useUpdateCourseBasicInfoMutation,
  useUpdateTopicBasicInfoMutation,
  useUpdateTopicExplanationMutation,
  useUpdateTopicQuestionMutation,
  useUpdateTopicSummaryMutation,
  useUpdateTopicVideoMutation,
} from '@/graphql/generated/generated-types';

import { FetchResult } from '@apollo/client';
import { useEffect, useState } from 'react';

export interface CourseHelper {
  course?: CourseDetailsFragment;
  loading: boolean;
  goToLink: (link: string) => void;
  updateCourseBasicInfo: (updates: CourseBasicInfoInput) => Promise<boolean>;

  updateTopic: (updates: UpdateTopicBasicInfoInput) => Promise<boolean>;
  addTopic: (updates: AddTopicInput) => Promise<boolean>;
  deleteTopic: (updates: DeleteTopicInput) => Promise<boolean>;
  moveTopic: (updates: MoveTopicInput) => Promise<boolean>;

  updateTopicExplanation: (updates: UpdateTopicExplanationInput) => Promise<boolean>;
  updateTopicSummary: (updates: UpdateTopicSummaryInput) => Promise<boolean>;
  updateTopicVideo: (updates: UpdateTopicVideoInput) => Promise<boolean>;
  updateTopicQuestion: (updates: UpdateTopicQuestionInput) => Promise<boolean>;

  addTopicExplanation: (updates: AddTopicExplanationInput) => Promise<boolean>;
  addTopicSummary: (updates: AddTopicSummaryInput) => Promise<boolean>;
  addTopicVideo: (updates: AddTopicVideoInput) => Promise<boolean>;
  addTopicQuestion: (updates: AddTopicQuestionInput) => Promise<boolean>;
  addTopicQuestions: (updates: AddTopicQuestionsInput) => Promise<boolean>;

  deleteTopicExplanation: (updates: DeleteTopicExplanationInput) => Promise<boolean>;
  deleteTopicSummary: (updates: DeleteTopicSummaryInput) => Promise<boolean>;
  deleteTopicVideo: (updates: DeleteTopicVideoInput) => Promise<boolean>;
  deleteTopicQuestion: (updates: DeleteTopicQuestionInput) => Promise<boolean>;

  moveTopicExplanation: (updates: MoveTopicExplanationInput) => Promise<boolean>;
  moveTopicSummary: (updates: MoveTopicSummaryInput) => Promise<boolean>;
  moveTopicVideo: (updates: MoveTopicVideoInput) => Promise<boolean>;
  moveTopicQuestion: (updates: MoveTopicQuestionInput) => Promise<boolean>;

  getTopic: (topicKey: string) => CourseTopicFragment;
  getTopicExplanation: (topicKey: string, explanationKey: string) => CourseExplanationFragment;
  getTopicSummary: (topicKey: string, summaryKey: string) => CourseSummaryFragment;
  getTopicVideo: (topicKey: string, videoKey: string) => CourseReadingFragment;
  getTopicQuestion: (topicKey: string, questionKey: string) => CourseQuestionFragment;
  getTopicQuestionByIndex: (topicKey: string, questionIndex: number) => CourseQuestionFragment;

  getTopicWithIndex: (topicKey: string) => { topic: CourseTopicFragment; index: number };
  getTopicExplanationWithIndex: (topicKey: string, explanationKey: string) => { explanation: CourseExplanationFragment; index: number };
  getTopicSummaryWithIndex: (topicKey: string, summaryKey: string) => { summary: CourseSummaryFragment; index: number };
  getTopicVideoWithIndex: (topicKey: string, videoKey: string) => { video: CourseReadingFragment; index: number };
  getTopicQuestionWithIndex: (topicKey: string, questionKey: string) => { question: CourseQuestionFragment; index: number };
}

const useViewCourse = (space: Space, courseKey: string): CourseHelper => {
  const [course, setCourse] = useState<CourseDetailsFragment | undefined>();

  const { refetch: getCourse, data, loading } = useGitCourseQueryQuery({ variables: { spaceId: space.id, courseKey: courseKey } });

  const { showNotification } = useNotificationContext();
  const [updateCourseBasicInfoMutation] = useUpdateCourseBasicInfoMutation();
  const [updateTopicBasicInfoMutation] = useUpdateTopicBasicInfoMutation();
  const [addTopicMutation] = useAddTopicMutation();
  const [deleteTopicMutation] = useDeleteTopicMutation();
  const [moveTopicMutation] = useMoveTopicMutation();

  const [updateTopicExplanationMutation] = useUpdateTopicExplanationMutation();
  const [updateTopicSummaryMutation] = useUpdateTopicSummaryMutation();
  const [updateTopicVideoMutation] = useUpdateTopicVideoMutation();
  const [updateTopicQuestionMutation] = useUpdateTopicQuestionMutation();

  const [addTopicExplanationMutation] = useAddTopicExplanationMutation();
  const [addTopicSummaryMutation] = useAddTopicSummaryMutation();
  const [addTopicVideoMutation] = useAddTopicVideoMutation();
  const [addTopicQuestionMutation] = useAddTopicQuestionMutation();
  const [addTopicQuestionsMutation] = useAddTopicQuestionsMutation();

  const [deleteTopicExplanationMutation] = useDeleteTopicExplanationMutation();
  const [deleteTopicSummaryMutation] = useDeleteTopicSummaryMutation();
  const [deleteTopicVideoMutation] = useDeleteTopicVideoMutation();
  const [deleteTopicQuestionMutation] = useDeleteTopicQuestionMutation();

  const [moveTopicExplanationMutation] = useMoveTopicExplanationMutation();
  const [moveTopicSummaryMutation] = useMoveTopicSummaryMutation();
  const [moveTopicVideoMutation] = useMoveTopicVideoMutation();
  const [moveTopicQuestionMutation] = useMoveTopicQuestionMutation();

  useEffect(() => {
    if (data?.course) {
      setCourse(data.course);
    }
  }, [data]);
  const checkResult = (result: FetchResult<{ payload: CourseDetailsFragment }>) => {
    const updatedCourse = result.data?.payload;
    if (updatedCourse) {
      setCourse(updatedCourse);
      showNotification({ message: 'Updated', type: 'success' });
      return true;
    } else {
      showNotification({ message: 'Failed to update', type: 'error' });
      return false;
    }
  };

  const checkResultAndNavigate = async (result: FetchResult<{ payload: any }>, route: string) => {
    const updated = result.data?.payload;
    if (updated) {
      const response = await getCourse();
      setCourse(response.data.course);
      history.replaceState(null, '', route);
      return true;
    } else {
      return false;
    }
  };

  const updateCourseBasicInfo = async (updates: CourseBasicInfoInput): Promise<boolean> => {
    const result = await updateCourseBasicInfoMutation({
      variables: {
        spaceId: space.id,
        courseBasicInfo: updates,
      },
    });
    return checkResult(result);
  };

  const updateTopicExplanation = async (updates: UpdateTopicExplanationInput): Promise<boolean> => {
    const result = await updateTopicExplanationMutation({
      variables: {
        spaceId: space.id,
        explanationInfo: updates,
      },
    });
    return checkResult(result);
  };

  const updateTopicSummary = async (updates: UpdateTopicSummaryInput): Promise<boolean> => {
    const result = await updateTopicSummaryMutation({
      variables: {
        spaceId: space.id,
        summaryInfo: updates,
      },
    });
    return checkResult(result);
  };

  const updateTopicVideo = async (updates: UpdateTopicVideoInput): Promise<boolean> => {
    const result = await updateTopicVideoMutation({
      variables: {
        spaceId: space.id,
        videoInfo: updates,
      },
    });
    return checkResult(result);
  };

  const updateTopicQuestion = async (updates: UpdateTopicQuestionInput): Promise<boolean> => {
    const result = await updateTopicQuestionMutation({
      variables: {
        spaceId: space.id,
        questionInfo: updates,
      },
    });
    return checkResult(result);
  };

  const addTopicExplanation = async (updates: AddTopicExplanationInput): Promise<boolean> => {
    const result = await addTopicExplanationMutation({
      variables: {
        spaceId: space.id,
        explanationInfo: updates,
      },
    });
    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${updates.topicKey}/explanations/${result.data?.payload.key}`);
  };

  const addTopicSummary = async (updates: AddTopicSummaryInput): Promise<boolean> => {
    const result = await addTopicSummaryMutation({
      variables: {
        spaceId: space.id,
        summaryInfo: updates,
      },
    });
    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${updates.topicKey}/summaries/${result.data?.payload.key}`);
  };

  const addTopicVideo = async (updates: AddTopicVideoInput): Promise<boolean> => {
    const result = await addTopicVideoMutation({
      variables: {
        spaceId: space.id,
        videoInfo: updates,
      },
    });
    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${updates.topicKey}/videos/${result.data?.payload.uuid}`);
  };

  const addTopicQuestion = async (updates: AddTopicQuestionInput): Promise<boolean> => {
    const result = await addTopicQuestionMutation({
      variables: {
        spaceId: space.id,
        questionInfo: updates,
      },
    });
    const questionIndex = course?.topics.find((topic) => topic.key === updates.topicKey)?.questions?.length || 0;
    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${updates.topicKey}/questions/${questionIndex}`);
  };

  const addTopicQuestions = async (input: AddTopicQuestionsInput): Promise<boolean> => {
    const result = await addTopicQuestionsMutation({
      variables: {
        spaceId: space.id,
        input: input,
      },
    });
    const questionIndex = course?.topics.find((topic) => topic.key === input.topicKey)?.questions?.length || 0;
    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${input.topicKey}/questions/${questionIndex}`);
  };

  const deleteTopicExplanation = async (updates: DeleteTopicExplanationInput): Promise<boolean> => {
    const result = await deleteTopicExplanationMutation({
      variables: {
        spaceId: space.id,
        explanationInfo: updates,
      },
    });
    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${updates.topicKey}`);
  };

  const deleteTopicSummary = async (updates: DeleteTopicSummaryInput): Promise<boolean> => {
    const result = await deleteTopicSummaryMutation({
      variables: {
        spaceId: space.id,
        summaryInfo: updates,
      },
    });
    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${updates.topicKey}`);
  };

  const deleteTopicVideo = async (updates: DeleteTopicVideoInput): Promise<boolean> => {
    const result = await deleteTopicVideoMutation({
      variables: {
        spaceId: space.id,
        videoInfo: updates,
      },
    });
    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${updates.topicKey}`);
  };

  const deleteTopicQuestion = async (updates: DeleteTopicQuestionInput): Promise<boolean> => {
    const result = await deleteTopicQuestionMutation({
      variables: {
        spaceId: space.id,
        questionInfo: updates,
      },
    });
    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${updates.topicKey}`);
  };

  const moveTopicExplanation = async (updates: MoveTopicExplanationInput): Promise<boolean> => {
    const result = await moveTopicExplanationMutation({
      variables: {
        spaceId: space.id,
        explanationInfo: updates,
      },
    });
    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${updates.topicKey}/explanations/${updates.explanationKey}`);
  };

  const moveTopicSummary = async (updates: MoveTopicSummaryInput): Promise<boolean> => {
    const result = await moveTopicSummaryMutation({
      variables: {
        spaceId: space.id,
        summaryInfo: updates,
      },
    });
    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${updates.topicKey}/summaries/${updates.summaryKey}`);
  };

  const moveTopicVideo = async (updates: MoveTopicVideoInput): Promise<boolean> => {
    const result = await moveTopicVideoMutation({
      variables: {
        spaceId: space.id,
        videoInfo: updates,
      },
    });
    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${updates.topicKey}/videos/${updates.videoUuid}`);
  };

  const moveTopicQuestion = async (updates: MoveTopicQuestionInput): Promise<boolean> => {
    const result = await moveTopicQuestionMutation({
      variables: {
        spaceId: space.id,
        questionInfo: updates,
      },
    });
    const questionIndex = course?.topics.find((topic) => topic.key === updates.topicKey)?.questions?.findIndex((q) => q.uuid === updates.questionUuid);

    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${updates.topicKey}/questions/${questionIndex}`);
  };

  const updateTopic = async (updates: UpdateTopicBasicInfoInput): Promise<boolean> => {
    const result = await updateTopicBasicInfoMutation({
      variables: {
        spaceId: space.id,
        topicInfo: updates,
      },
    });
    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${updates.topicKey}`);
  };
  const addTopic = async (updates: AddTopicInput): Promise<boolean> => {
    const result = await addTopicMutation({
      variables: {
        spaceId: space.id,
        topicInfo: updates,
      },
    });
    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${result.data?.payload.key}`);
  };
  const deleteTopic = async (updates: DeleteTopicInput): Promise<boolean> => {
    const result = await deleteTopicMutation({
      variables: {
        spaceId: space.id,
        topicInfo: updates,
      },
    });
    return checkResultAndNavigate(result, `/courses/view/${course?.key}`);
  };
  const moveTopic = async (updates: MoveTopicInput): Promise<boolean> => {
    const result = await moveTopicMutation({
      variables: {
        spaceId: space.id,
        topicInfo: updates,
      },
    });
    return checkResultAndNavigate(result, `/courses/view/${course?.key}/${updates.topicKey}`);
  };

  const goToLink = (link: string) => {
    console.log('goToLink', link);
    history.replaceState(null, '', link);
  };

  const getTopic = (topicKey: string): CourseTopicFragment => {
    const topic = course?.topics.find((topic) => topic.key === topicKey);
    if (!topic) throw new Error(`Topic ${topicKey} not found`);
    return topic;
  };

  const getTopicExplanation = (topicKey: string, explanationKey: string): CourseExplanationFragment => {
    const topic = getTopic(topicKey);
    const explanation = topic.explanations.find((explanation) => explanation.key === explanationKey);
    if (!explanation) throw new Error(`Explanation ${explanationKey} not found`);
    return explanation;
  };

  const getTopicSummary = (topicKey: string, summaryKey: string): CourseSummaryFragment => {
    const topic = getTopic(topicKey);
    const summary = topic.summaries.find((summary) => summary.key === summaryKey);
    if (!summary) throw new Error(`Summary ${summaryKey} not found`);
    return summary;
  };

  const getTopicVideo = (topicKey: string, videoUuid: string): CourseReadingFragment => {
    const topic = getTopic(topicKey);
    const video = topic.readings.find((video) => video.uuid === videoUuid);
    if (!video) throw new Error(`Video ${videoUuid} not found`);
    return video;
  };

  const getTopicQuestion = (topicKey: string, questionUuid: string): CourseQuestionFragment => {
    const topic = getTopic(topicKey);
    const question = topic.questions.find((question) => question.uuid === questionUuid);
    if (!question) throw new Error(`Question ${questionUuid} not found`);
    return question;
  };

  const getTopicQuestionByIndex = (topicKey: string, index: number): CourseQuestionFragment => {
    const topic = getTopic(topicKey);
    const question = topic.questions?.[index];
    if (!question) throw new Error(`Question ${0} not found`);
    return question;
  };

  const getTopicWithIndex = (topicKey: string): { topic: CourseTopicFragment; index: number } => {
    const index = course?.topics.findIndex((topic) => topic.key === topicKey);
    if (index === -1 || index === undefined) throw new Error(`Topic ${topicKey} not found`);
    return { topic: course!.topics[index], index: index };
  };
  const getTopicExplanationWithIndex = (topicKey: string, explanationKey: string): { explanation: CourseExplanationFragment; index: number } => {
    const topic = getTopic(topicKey);
    const index = topic.explanations.findIndex((explanation) => explanation.key === explanationKey);
    if (index === -1) throw new Error(`Explanation ${explanationKey} not found`);
    return { explanation: topic.explanations[index], index: index };
  };

  const getTopicSummaryWithIndex = (topicKey: string, summaryKey: string): { summary: CourseSummaryFragment; index: number } => {
    const topic = getTopic(topicKey);
    const index = topic.summaries.findIndex((summary) => summary.key === summaryKey);
    if (index === -1) throw new Error(`Summary ${summaryKey} not found`);
    return { summary: topic.summaries[index], index: index };
  };

  const getTopicVideoWithIndex = (topicKey: string, videoUuid: string): { video: CourseReadingFragment; index: number } => {
    const topic = getTopic(topicKey);
    const index = topic.readings.findIndex((video) => video.uuid === videoUuid);
    if (index === -1) throw new Error(`Video ${videoUuid} not found`);
    return { video: topic.readings[index], index: index };
  };

  const getTopicQuestionWithIndex = (topicKey: string, questionUuid: string): { question: CourseQuestionFragment; index: number } => {
    const topic = getTopic(topicKey);
    const index = topic.questions.findIndex((question) => question.uuid === questionUuid);
    if (index === -1) throw new Error(`Question ${questionUuid} not found`);
    return { question: topic.questions[index], index: index };
  };

  return {
    course,
    loading,
    goToLink,
    updateCourseBasicInfo,

    updateTopicExplanation,
    updateTopicSummary,
    updateTopicVideo,
    updateTopicQuestion,

    addTopicExplanation,
    addTopicSummary,
    addTopicVideo,
    addTopicQuestion,
    addTopicQuestions,

    deleteTopicExplanation,
    deleteTopicSummary,
    deleteTopicVideo,
    deleteTopicQuestion,

    moveTopicExplanation,
    moveTopicSummary,
    moveTopicVideo,
    moveTopicQuestion,

    updateTopic,
    addTopic,
    deleteTopic,
    moveTopic,

    getTopic,
    getTopicExplanation,
    getTopicSummary,
    getTopicVideo,
    getTopicQuestion,
    getTopicQuestionByIndex,

    getTopicWithIndex,
    getTopicExplanationWithIndex,
    getTopicSummaryWithIndex,
    getTopicVideoWithIndex,
    getTopicQuestionWithIndex,
  };
};

export default useViewCourse;
