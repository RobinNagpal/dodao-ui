import {
  AddTopicExplanationInput,
  AddTopicInput,
  AddTopicQuestionInput,
  AddTopicSummaryInput,
  AddTopicVideoInput,
  CourseBasicInfoInput,
  CourseDetailsFragment,
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
import { useState } from 'react';

export interface UseViewCourseHelper {
  course?: CourseDetailsFragment;
  initialize: () => Promise<void>;
  loading: boolean;
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

  deleteTopicExplanation: (updates: DeleteTopicExplanationInput) => Promise<boolean>;
  deleteTopicSummary: (updates: DeleteTopicSummaryInput) => Promise<boolean>;
  deleteTopicVideo: (updates: DeleteTopicVideoInput) => Promise<boolean>;
  deleteTopicQuestion: (updates: DeleteTopicQuestionInput) => Promise<boolean>;

  moveTopicExplanation: (updates: MoveTopicExplanationInput) => Promise<boolean>;
  moveTopicSummary: (updates: MoveTopicSummaryInput) => Promise<boolean>;
  moveTopicVideo: (updates: MoveTopicVideoInput) => Promise<boolean>;
  moveTopicQuestion: (updates: MoveTopicQuestionInput) => Promise<boolean>;
}

const useViewCourse = (space: Space, courseKey: string): UseViewCourseHelper => {
  const [course, setCourse] = useState<CourseDetailsFragment | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  const { refetch: getCourse } = useGitCourseQueryQuery({ variables: { spaceId: space.id, courseKey: courseKey }, skip: true });
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
  const [deleteTopicExplanationMutation] = useDeleteTopicExplanationMutation();
  const [deleteTopicSummaryMutation] = useDeleteTopicSummaryMutation();
  const [deleteTopicVideoMutation] = useDeleteTopicVideoMutation();
  const [deleteTopicQuestionMutation] = useDeleteTopicQuestionMutation();
  const [moveTopicExplanationMutation] = useMoveTopicExplanationMutation();
  const [moveTopicSummaryMutation] = useMoveTopicSummaryMutation();
  const [moveTopicVideoMutation] = useMoveTopicVideoMutation();
  const [moveTopicQuestionMutation] = useMoveTopicQuestionMutation();
  const initialize = async () => {
    setLoading(true);
    const response = await getCourse();
    setCourse(response.data.course);
    setLoading(false);
  };

  const checkResult = (result: FetchResult<{ payload: CourseDetailsFragment }>) => {
    const updatedCourse = result.data?.payload;
    if (updatedCourse) {
      setCourse(updatedCourse);

      return true;
    } else {
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

  return {
    course,
    loading,
    initialize,
    updateCourseBasicInfo,

    updateTopicExplanation,
    updateTopicSummary,
    updateTopicVideo,
    updateTopicQuestion,

    addTopicExplanation,
    addTopicSummary,
    addTopicVideo,
    addTopicQuestion,

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
  };
};

export default useViewCourse;
