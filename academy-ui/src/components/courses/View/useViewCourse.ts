import {
  CourseDetailsFragment,
  CourseExplanationFragment,
  CourseQuestionFragment,
  CourseReadingFragment,
  CourseSummaryFragment,
  CourseTopicFragment,
} from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';

import { FetchResult } from '@apollo/client';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import axios from 'axios';
import { useEffect, useState } from 'react';

export interface CourseHelper {
  course?: CourseDetailsFragment;
  loading: boolean;
  goToLink: (link: string) => void;
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

const useViewCourse = (space: SpaceWithIntegrationsDto, courseKey: string): CourseHelper => {
  const [course, setCourse] = useState<CourseDetailsFragment | undefined>();

  const [data, setData] = useState<{ course?: CourseDetailsFragment }>();
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotificationContext();
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await axios.get(`/api/courses/${courseKey}`);
      setData(response.data);

      setCourse(response.data.course);
      setLoading(false);
    }
    fetchData();
  }, [courseKey]);
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
      const response = await axios.get(`/api/courses/${courseKey}`);
      setCourse(response.data.course);
      history.replaceState(null, '', route);
      return true;
    } else {
      return false;
    }
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
