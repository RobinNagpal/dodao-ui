import AddIcon from '@/components/app/Icons/AddIcon';
import ReadingIcon from '@/components/app/Icons/ReadingIcon';
import TreeItem from '@/components/app/Tree/TreeItem';
import TreeView from '@/components/app/Tree/TreeView';
import Button from '@/components/core/buttons/Button';
import { CourseDetailsFragment, Space } from '@/graphql/generated/generated-types';
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

  return (
    <Container className="p-4 min-h-auto bg-skin-header-bg rounded-l-lg border-skin-border h-full w-full">
      {isCourseAdmin && (
        <Button primary variant="contained" className="w-full mb-4" onClick={() => {}}>
          <AddIcon /> Add
        </Button>
      )}
      <TreeView>
        {course.topics?.map((chapter, i) => {
          return (
            <TreeItem id={chapter.key} key={chapter.key}>
              <TreeView>
                {chapter.readings.map((reading, i) => {
                  return (
                    <TreeItem id={reading.uuid} key={reading.uuid}>
                      <Link href={`/courses/view/${course.key}/${chapter.key}/readings`}>
                        <span className="mt-1 flex items-center">
                          <span className="icon mr-2">
                            <ReadingIcon />
                          </span>
                          Videos
                        </span>
                      </Link>
                    </TreeItem>
                  );
                })}
              </TreeView>
            </TreeItem>
          );
        })}
      </TreeView>
    </Container>
  );
};

export default CourseComponent;
