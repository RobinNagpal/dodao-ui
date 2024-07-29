import UpsertRawCourseModal from '@/components/app/Modal/Course/UpsertRawCourseModal';
import EllipsisDropdown from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { SpaceWithIntegrationsFragment, RawGitCourse } from '@/graphql/generated/generated-types';
import { Session } from '@dodao/web-core/types/auth/Session';
import { PublishStatus } from '@dodao/web-core/types/deprecated/models/enums';
import { isSuperAdmin } from '@dodao/web-core/utils/auth/superAdmins';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export interface BasicCourseConfigurationsProps {
  space: SpaceWithIntegrationsFragment;
  courseKey: string;
}
export default function BasicCourseConfigurations({ space, courseKey }: BasicCourseConfigurationsProps) {
  const { data: session } = useSession();
  const isUserASuperAdmin = session && isSuperAdmin(session as Session);
  const [rawGitCourse, setRawGitCourse] = useState<{ course?: RawGitCourse }>();

  const [showUpsertRawCourseModal, setShowUpsertRawCourseModal] = useState(false);

  const { showNotification } = useNotificationContext();

  function editRawCourseInfo() {
    setShowUpsertRawCourseModal(true);
  }

  useEffect(() => {
    async function fetchRawCourse() {
      const response = await axios.get(`/api/courses/${courseKey}`);
      setRawGitCourse(response.data);
    }
    // This logic won't work as we don't have raw courses now
    fetchRawCourse();
  }, [space.id, courseKey]);

  async function refreshCourse() {
    // This call won't work as the backend logic isn't implemented
    await fetch('/api/courses/refresh-course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spaceId: space.id,
        courseKey: courseKey,
      }),
    });
    showNotification({ type: 'success', message: 'Course refreshed successfully' });
  }

  const selectFromThreedotDropdown = (e: string) => {
    if (e === 'editRawCourseInfo') editRawCourseInfo();
    if (e === 'refreshCourse') refreshCourse();
  };

  const threeDotItems = [
    { label: 'Edit Raw Course Info', key: 'editRawCourseInfo' },
    { label: 'Refresh', key: 'refreshCourse' },
  ];

  return isUserASuperAdmin ? (
    <div className="pull-right float-right mr-2 ml-4 pt-1 topnav-domain-navigation-three-dots">
      <EllipsisDropdown items={threeDotItems} onSelect={selectFromThreedotDropdown} />
      {showUpsertRawCourseModal && (
        <UpsertRawCourseModal
          open={showUpsertRawCourseModal}
          onClose={() => setShowUpsertRawCourseModal(false)}
          rawGitCourse={rawGitCourse?.course}
          onUpsertRawCourse={async (repoUrl: string, publishStatus: PublishStatus, weight: number) => {
            // This logic won't work as the backend logic isn't implemented
            const response = await fetch(`/api/courses/${courseKey}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                spaceId: space.id,
                gitCourseInput: {
                  courseRepoUrl: repoUrl,
                  publishStatus,
                  weight,
                },
              }),
            });
            if (response.ok) {
              showNotification({ type: 'success', message: 'Course added successfully' });
              setShowUpsertRawCourseModal(false);
            } else {
              showNotification({ type: 'error', message: 'Failed to add course' });
            }
          }}
        />
      )}
    </div>
  ) : null;
}
