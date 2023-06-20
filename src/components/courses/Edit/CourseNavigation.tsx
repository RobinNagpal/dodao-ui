import AddIcon from '@/components/core/icons/AddIcon';
import { Tree } from '@/components/app/TreeView/Tree';
import { TreeNodeType } from '@/components/app/TreeView/TreeNode';
import Button from '@/components/core/buttons/Button';
import { ItemTypes } from '@/components/courses/View/CourseDetailsRightSection';
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
  topicKey?: string;
  itemType?: ItemTypes;
  itemKey?: string;
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

  /* Add CSS class to underline text of currently open child node */
  .underline {
    text-decoration: underline;
  }
`;

function getReadings(courseKey: string, topic: CourseTopicFragment, readings: CourseReadingFragment[], itemKey: string) {
  return readings.map((reading, i) => {
    const isActive = itemKey === reading.uuid;
    return {
      component: (
        <Link
          key={reading.uuid}
          className={`flex items-center ${isActive ? 'underline' : ''}`}
          href={`/courses/view/${courseKey}/${topic.key}/readings/${reading.uuid}`}
        >
          <div className="icon mr-2">
            <CheckMark />
          </div>
          <div>{reading.title}</div>
        </Link>
      ),
    };
  });
}

function getExplanations(courseKey: string, topic: CourseTopicFragment, explanations: CourseExplanationFragment[], itemKey: string) {
  return explanations.map((explanation, i) => {
    const isActive = itemKey === explanation.key;
    return {
      component: (
        <Link
          key={explanation.key}
          className={`flex items-center ${isActive ? 'underline' : ''}`}
          href={`/courses/view/${courseKey}/${topic.key}/explanations/${explanation.key}`}
        >
          <div className="icon mr-2">
            <CheckMark />
          </div>
          <div>{explanation.title}</div>
        </Link>
      ),
    };
  });
}

function getSummaries(courseKey: string, topic: CourseTopicFragment, summaries: CourseSummaryFragment[], itemKey: string) {
  return summaries.map((summary, i) => {
    const isActive = itemKey === summary.key;
    return {
      component: (
        <Link
          key={summary.key}
          className={`flex items-center ${isActive ? 'underline' : ''}`}
          href={`/courses/view/${courseKey}/${topic.key}/summaries/${summary.key}`}
        >
          <div className="icon mr-2">
            <CheckMark />
          </div>
          <div>{summary.title}</div>
        </Link>
      ),
    };
  });
}

function getTreeData(course: CourseDetailsFragment, itemKey: string) {
  return course.topics.map((chapter, i) => {
    const readings: TreeNodeType[] = getReadings(course.key, chapter, chapter.readings, itemKey);
    const explanations: TreeNodeType[] = getExplanations(course.key, chapter, chapter.explanations, itemKey);
    const summaries: TreeNodeType[] = getSummaries(course.key, chapter, chapter.summaries, itemKey);

    const children: TreeNodeType[] = [];
    if (readings.length) {
      children.push({
        component: (
          <ClickableDiv key={chapter.key + '_readings'} className="flex items-center">
            <div className="icon mr-2">
              <CheckMark />
            </div>
            <div>Videos</div>
          </ClickableDiv>
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
          <Link
            key={chapter.key + '_questions'}
            className={`flex items-center ${itemKey === '0' ? 'underline' : ''}`}
            href={`/courses/view/${course.key}/${chapter.key}/questions/0`}
          >
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
        <Link
          key={chapter.key + '_chapter_submission'}
          className={`flex items-center ${itemKey === 'submission' ? 'underline' : ''}`}
          href={`/courses/view/${course.key}/${chapter.key}/submission`}
        >
          <div className="icon mr-2">
            <CheckMark />
          </div>
          <div>Chapter Submission</div>
        </Link>
      ),
      children: [],
    });

    const isActive = itemKey === chapter.key;
    return {
      component: (
        <Link
          key={chapter.key + '_chapter_root'}
          className={`flex items-center ${isActive ? 'underline' : ''}`}
          href={`/courses/view/${course.key}/${chapter.key}`}
        >
          <div className="icon mr-2">
            <CheckMark />
          </div>
          <div>{chapter.title}</div>
        </Link>
      ),
      children: children,
    };
  });
}

const CourseComponent: React.FC<CourseNavigationProps> = ({ course, showAddModal, topicKey, itemKey, itemType }) => {
  const isCourseAdmin = true;
  const [openNodes, setOpenNodes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (topicKey && itemKey && itemType) {
      setOpenNodes({
        ...openNodes,
        '1': topicKey + '_chapter_root',
        '2': topicKey + '_' + itemType,
      });

      return;
    }
    if (topicKey) {
      setOpenNodes({
        ...openNodes,
        '1': topicKey! + '_chapter_root',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicKey, itemKey, itemType]);

  const treeData: TreeNodeType[] = getTreeData(course, itemKey || '0');

  return (
    <Container className="p-4 bg-skin-header-bg rounded-l-lg border-skin-border h-full w-full">
      {isCourseAdmin && (
        <Button primary variant="contained" className="w-full mb-4" onClick={showAddModal}>
          <AddIcon /> Add
        </Button>
      )}
      <Tree data={treeData} openNodes={openNodes} setOpenNodes={setOpenNodes} />
    </Container>
  );
};

export default CourseComponent;
