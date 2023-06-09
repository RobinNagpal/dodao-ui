import AddIcon from '@/components/app/Icons/AddIcon';
import ReadingIcon from '@/components/app/Icons/ReadingIcon';
import TreeItem from '@/components/app/Tree/TreeItem';
import TreeView from '@/components/app/Tree/TreeView';
import { Tree } from '@/components/app/TreeView/Tree';
import { TreeNodeType } from '@/components/app/TreeView/TreeNode';
import Button from '@/components/core/buttons/Button';
import { CourseDetailsFragment, CourseExplanationFragment, CourseReadingFragment, CourseSummaryFragment, Space } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface CourseNavigationProps {
  course: CourseDetailsFragment;
  space: Space;
  showAddModal: () => void;
}

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

  .checkmark {
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
      -ms-transform: rotate(45deg);
      position: absolute;
    }
  }
`;

const CourseComponent: React.FC<CourseNavigationProps> = ({ course, space, showAddModal }) => {
  const isCourseAdmin = true;
  const [openChapter, setOpenChapter] = useState(location.pathname);
  const [nodemap, setNodemap] = useState<any>({});

  const handleToggle = (key: string, open: boolean) => {
    if (open) {
      setOpenChapter(key);
    } else {
      setOpenChapter('');
    }
  };

  const handleToggleSubHeading = (key: string, open: boolean) => {
    setNodemap({ ...nodemap, [key]: open });
  };

  useEffect(() => {
    if (location.pathname === 'courseSummary') {
      setNodemap({ ...nodemap, [`summary-${location.pathname}`]: true });
    } else if (location.pathname === 'courseReading') {
      setNodemap({ ...nodemap, [`reading-${location.pathname}`]: true });
    } else if (location.pathname === 'courseExplanation') {
      setNodemap({ ...nodemap, [`explanation-${location.pathname}`]: true });
    }
    if (location.pathname) {
      setOpenChapter(location.pathname);
    }
  }, [location]);
  const treeData: TreeNodeType[] = [
    {
      component: <div key="p1">Parent 1</div>,
      children: [
        { component: <div key="c1.1">Child 1.1</div> },
        {
          component: <div key="c1.2">Child 1.2</div>,
          children: [{ component: <div key="gc1.2.1">Grandchild 1.2.1</div> }],
        },
      ],
    },
    {
      component: <div key="p2">Parent 2</div>,
      children: [{ component: <div key="c2.1">Child 2.1</div> }],
    },
    {
      component: <div key="p3">Parent 3</div>,
    },
  ];

  function getReadings(readings: CourseReadingFragment[]) {
    return readings.map((reading, i) => {
      return {
        component: (
          <div key={reading.uuid} className="flex items-center">
            <span className="icon mr-2">
              <CheckMark />
            </span>
            <span className="item-title">{reading.title}</span>
          </div>
        ),
      };
    });
  }

  function getExplanations(explanations: CourseExplanationFragment[]) {
    return explanations.map((explanation, i) => {
      return {
        component: (
          <div key={explanation.key} className="flex items-center">
            <span className="icon mr-2">
              <CheckMark />
            </span>
            <span className="item-title">{explanation.title}</span>
          </div>
        ),
      };
    });
  }
  function getSummaries(summaries: CourseSummaryFragment[]) {
    return summaries.map((summary, i) => {
      return {
        component: (
          <div key={summary.key} className="flex items-center">
            <span className="icon mr-2">
              <CheckMark />
            </span>
            <span className="item-title">{summary.title}</span>
          </div>
        ),
      };
    });
  }

  const treeData1: TreeNodeType[] = course.topics.map((chapter, i) => {
    const readings: TreeNodeType[] = getReadings(chapter.readings);
    const explanations: TreeNodeType[] = getExplanations(chapter.explanations);
    const summaries: TreeNodeType[] = getSummaries(chapter.summaries);

    const children: TreeNodeType[] = [];
    if (readings.length) {
      children.push({
        component: (
          <div key={chapter.key} className="flex items-center">
            <span className="icon mr-2">
              <CheckMark />
            </span>
            <span className="item-title">Videos</span>
          </div>
        ),
        children: readings,
      });
    }
    if (explanations.length) {
      children.push({
        component: (
          <div key={chapter.key} className="flex items-center">
            <span className="icon mr-2">
              <CheckMark />
            </span>
            <span className="item-title">Explanations</span>
          </div>
        ),
        children: explanations,
      });
    }
    if (summaries.length) {
      children.push({
        component: (
          <div key={chapter.key} className="flex items-center">
            <span className="icon mr-2">
              <CheckMark />
            </span>
            <span className="item-title">Summaries</span>
          </div>
        ),
        children: summaries,
      });
    }
    return {
      component: (
        <div key={chapter.key} className="flex items-center">
          <span className="icon mr-2">
            <CheckMark />
          </span>
          <span className="item-title">{chapter.title}</span>
        </div>
      ),
      children: children,
    };
  });

  return (
    <Container className="p-4 min-h-auto bg-skin-header-bg rounded-l-lg border-skin-border h-full w-full">
      {isCourseAdmin && (
        <Button primary variant="contained" className="w-full mb-4" onClick={() => {}}>
          <AddIcon /> Add
        </Button>
      )}
      <Tree data={treeData1} />
    </Container>
  );
};

export default CourseComponent;
