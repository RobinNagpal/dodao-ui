import AddIcon from '@/components/app/Icons/AddIcon';
import { Tree } from '@/components/app/TreeView/Tree';
import { TreeNodeType } from '@/components/app/TreeView/TreeNode';
import Button from '@/components/core/buttons/Button';
import { CourseSubmissionHelper } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import {
  CourseDetailsFragment,
  CourseExplanationFragment,
  CourseReadingFragment,
  CourseSummaryFragment,
  CourseTopicFragment,
  Space,
} from '@/graphql/generated/generated-types';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface CourseNavigationProps {
  course: CourseDetailsFragment;
  space: Space;
  showAddModal: () => void;
  courseHelper: CourseHelper;
  submissionHelper: CourseSubmissionHelper;
}
const ClickableDiv = styled.div`
  cursor: pointer;
`;

const CheckMark = styled.div`
  position: relative;
  height: 20px;
  width: 20px;
  text-align: center;
  background-color: #00813a;
  border: 1px solid #00813a;
  border-radius: 50%;
  z-index: 1;

  &:after {
    content: '';
    left: 6px;
    top: 3px;
    width: 6px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    position: absolute;
  }
`;

const Container = styled.div`
  .icon {
    display: flex;
  }

  .nav-item {
    @apply mb-2;
    color: var(--text-color);

    &.active {
      background: rgba(255, 255, 255, 0.2);
      @apply font-bold text-primary;

      .icon {
        svg {
          fill: var(--primary-color);
        }
      }
    }
  }

  .item-title {
    max-height: 40px;
  }

  .nav-list {
    margin-left: 0;
    list-style-type: none;
  }
`;

const CourseComponent: React.FC<CourseNavigationProps> = ({ course, space, showAddModal, courseHelper }) => {
  const isCourseAdmin = true;
  const [treeData, setTreeData] = useState<TreeNodeType[]>([]);

  
  function getReadings(topic: CourseTopicFragment, readings: CourseReadingFragment[]) {
    return readings.map((reading, i) => {
      return {
        component: (
          <Link key={reading.uuid} className="flex items-center" href={`/courses/view/${course.key}/${topic.key}/readings/${reading.uuid}`}>
            <div className="icon mr-2">
              <CheckMark />
            </div>
            <div>{reading.title}</div>
          </Link>
        ),
      };
    });
  }

  function getExplanations(topic: CourseTopicFragment, explanations: CourseExplanationFragment[]) {
    return explanations.map((explanation, i) => {
      return {
        component: (
          <Link key={explanation.key} className="flex items-center" href={`/courses/view/${course.key}/${topic.key}/explanations/${explanation.key}`}>
            <div className="icon mr-2">
              <CheckMark />
            </div>
            <div>{explanation.title}</div>
          </Link>
        ),
      };
    });
  }
  function getSummaries(topic: CourseTopicFragment, summaries: CourseSummaryFragment[]) {
    return summaries.map((summary, i) => {
      return {
        component: (
          <Link key={summary.key} className="flex items-center" href={`/courses/view/${course.key}/${topic.key}/summaries/${summary.key}`}>
            <div className="icon mr-2">
              <CheckMark />
            </div>
            <div>{summary.title}</div>
          </Link>
        ),
      };
    });
  }
  useEffect(() => {
    // Generate initial tree data with isOpen property
    const treeData: TreeNodeType[] = course.topics.map((chapter, i) => {
      const readings: TreeNodeType[] = getReadings(chapter, chapter.readings);
      const explanations: TreeNodeType[] = getExplanations(chapter, chapter.explanations);
      const summaries: TreeNodeType[] = getSummaries(chapter, chapter.summaries);

      const children: TreeNodeType[] = [];
      if (readings.length) {
        children.push({
          component: (
            <div key={chapter.key + '_readings'} className="flex items-center">
              <div className="icon mr-2">
                <CheckMark />
              </div>
              <div>Videos</div>
            </div>
          ),
          children: readings,
        });
      }
      if (explanations.length) {
        children.push({
          component: (
            <div key={chapter.key + '_explanations'} className="flex items-center">
              <div className="icon mr-2">
                <CheckMark />
              </div>
              <div>Explanations</div>
            </div>
          ),
          children: explanations,
        });
      }
      if (summaries.length) {
        children.push({
          component: (
            <div key={chapter.key + '_summaries'} className="flex items-center">
              <div className="icon mr-2">
                <CheckMark />
              </div>
              <div>Summaries</div>
            </div>
          ),
          children: summaries,
        });
      }
      if (chapter.questions.length) {
        children.push({
          component: (
            <Link key={chapter.key + '_questions'} className="flex items-center" href={`/courses/view/${course.key}/${chapter.key}/questions/0`}>
              <div className="icon mr-2">
                <CheckMark />
              </div>
              <div>Questions</div>
            </Link>
          ),
          children: [],
        });
      }

      children.push({
        component: (
          <Link key={chapter.key + '_chapter_submission'} className="flex items-center" href={`/courses/view/${course.key}/${chapter.key}/submission`}>
            <div className="icon mr-2">
              <CheckMark />
            </div>
            <div>Chapter Submission</div>
          </Link>
        ),
        children: [],
      });

      return {
        component: (
          <Link key={chapter.key + '_chapter_root'} className="flex items-center" href={`/courses/view/${course.key}/${chapter.key}`}>
            <div className="icon mr-2">
              <CheckMark />
            </div>
            <div>{chapter.title}</div>
          </Link>
        ),
        children: children,
        isOpen: true,
      };
    });

    setTreeData(treeData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course]);

  return (
    <Container className="p-4 bg-skin-header-bg rounded-l-lg border-skin-border h-full w-full">
      {isCourseAdmin && (
        <Button primary variant="contained" className="w-full mb-4" onClick={showAddModal}>
          <AddIcon /> Add
        </Button>
      )}
      <Tree data={treeData} />
    </Container>
  );
};

export default CourseComponent;